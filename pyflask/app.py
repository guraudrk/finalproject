from flask import Flask, render_template, Response
import os
import json
import numpy as np
import cv2
import time

from IPython import display
from PIL import Image
from ultralytics import YOLO
from PIL import ImageFont, ImageDraw, Image

# 라이브러리 충돌 방지
import os
os.environ['KMP_DUPLICATE_LIB_OK']='True'

model = YOLO(r"C:\Users\User\finalproject\pyflask\best.pt")

label2id = {'etc': 0,
            'PE드럼 정상': 1,
            'PE드럼 파손': 2,
            'PE방호벽 정상': 3,
            'PE방호벽 파손': 4,
            'PE안내봉 정상': 5,
            'PE안내봉 파손': 6,
            '라바콘 정상': 7,
            '라바콘 파손': 8,
            '시선유도봉 정상': 9,
            '시선유도봉 파손': 10,
            '제설함 정상': 11,
            '제설함 파손': 12,
            'PE입간판 정상': 13,
            'PE입간판 파손': 14,
            'PE휀스 정상': 15,
            'PE휀스 파손': 16}

id2label = {v: k for k, v in label2id.items()}

################## 함수정의 ##################
def find_largest_bbox(track_info_dict, id2label):
    """
    각 bounding box의 넓이를 계산하고, 가장 큰 bbox를 찾는 함수
    """
    max_area = 0
    max_area_bbox = None
    max_area_track_id = None
    max_area_class_name = None

    for track_id, track_info in track_info_dict.items():
        class_id = track_info['cls_id']
        class_name = id2label[class_id] if class_id in id2label else f'Unknown_{class_id}'

        bbox = track_info['bbox'].int().tolist()
        area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])

        if area > max_area:
            max_area = area
            max_area_bbox = bbox
            max_area_track_id = track_id
            max_area_class_name = class_name

    return max_area_bbox, max_area_track_id, max_area_class_name

def crop_and_save(frame, bbox, path):
    """
    주어진 bbox를 프레임에서 잘라내고, 잘라낸 부분을 주어진 경로에 저장하는 함수
    """
    cropped_frame = frame[bbox[1]:bbox[3], bbox[0]:bbox[2]]
    cv2.imwrite(path, cropped_frame)

def current_location():
    here_req = requests.get("http://www.geoplugin.net/json.gp")
    if (here_req.status_code != 200):
        print("현재좌표를 불러올 수 없음")
        return None
    else:
        location = json.loads(here_req.text)
        crd = {"lat": str(location["geoplugin_latitude"]), "lng": str(location["geoplugin_longitude"])}
        return crd

def transfer_data(cursor, conn, s3_client, bucket_name, local_image_path, category_name):
    # 현재 pc가 위치한 gps좌표 수집
    here_req = requests.get("http://www.geoplugin.net/json.gp")
    location = json.loads(here_req.text)
    
    lat = location['geoplugin_latitude']
    long = location['geoplugin_longitude']

    # 현재 날짜시간정보 수집
    current_datetime = datetime.now()
    # S3에 이미지 업로드
    s3_object_key = f'finalprojectimage/{os.path.basename(local_image_path)}'
    # S3 URL 생성
    s3_url = f'https://{bucket_name}.s3.ap-northeast-2.amazonaws.com/{s3_object_key}'
    # 'gps_data' 테이블에 GPS 정보, 날짜, S3 경로, 카테고리 저장
    query = 'INSERT INTO facility_info (latitude, longitude, creation_time, photo_info, category_id) VALUES (%s, %s, %s, %s, %s)'
    values = (lat, long, current_datetime, s3_url, category_name)
    
    # s3에 이미지 업로드
    s3_client.upload_file(local_image_path, bucket_name, s3_object_key)

    cursor.execute(query, values)
    conn.commit()

######################################

############## AWS 연결 ##################
import psycopg2
from geopy.geocoders import Nominatim
from decimal import Decimal
from datetime import datetime
import requests
import boto3

# AWS 계정 정보
aws_access_key_id = 'AKIA43IC3LBBCBPD3VEM'
aws_secret_access_key = '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'
aws_region = 'ap-northeast-2'  
bucket_name = 'playdataroads'

# AWS S3 클라이언트 생성
s3_client = boto3.client('s3', 
                         aws_access_key_id=aws_access_key_id,
                         aws_secret_access_key=aws_secret_access_key, 
                         region_name=aws_region)
########################################

##### Flask 연결 #####
app = Flask(__name__)

@app.route('/')
def image_show():
    return render_template('image_show.html')
#####################

def gen_frames():
    ##### setting #####
    image_folder_path = r"C:\Users\User\finalproject\pyflask\scene\scene2"
    output_folder_path = r"C:\Users\User\finalproject\pyflask\output_tracking"

    test_paths = []
    for filename in sorted(os.listdir(image_folder_path), key=lambda x: int(x.split("_")[1].split(".")[0])):
        if filename.endswith(".jpg") and filename.startswith("frame_"):
            file_path = os.path.join(image_folder_path, filename)
            test_paths.append(file_path)

    broken_categories = [2, 4, 6, 8, 10, 12, 14, 16]   # 파손만 검출해야함
    font = ImageFont.truetype(r"C:\Users\User\finalproject\pyflask\NanumGothic.ttf", 30)

    prev_cropped_path = None
    tracks = {}
    IMGSZ = 640
    ####################

    ##### PostgreSQL DB 연결 #####
    db_params = {'dbname': 'ROADs',
                 'user': 'postgres',
                 'password': 'dudtlr2378!',
                 'host': 'localhost',
                 'port': '5432'
                }

    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    #############################

    #####   1. 이미지를 순차적으로 1~100 돌면서 검출 & 프레임당 가지고 있는 정보 가져오기(tracks에 저장됨)  #####
    for i, image_path in enumerate(test_paths):
        frame = cv2.imread(image_path)
        results = model.track(frame, persist=True, imgsz=IMGSZ, verbose=False)
        
        # 트랙: {0: {'latest_bbox_info': {'bbox': tensor([550.9120, 516.0292, 591.8289, 719.9888]), 'cls_id': 0}}}
        print(f'트랙: {tracks}')
        
        current_frame_track_info = {int(box[4].item()): {'bbox': box[:4], 
                                                     'cls_id': int(box[6].item()) if len(box) == 7 else int(box[5].item())} 
                                for box in results[0].boxes.data if int(box[6].item() if len(box) == 7 else box[5].item()) in broken_categories}
        print(f'current_frame_track_info: {current_frame_track_info}')

    ##### 각 프레임에서 검출된 모든 객체의 bbox와 클래스명을 화면에 표시 #####
        for track_id, track_info in current_frame_track_info.items():
            bbox = track_info['bbox'].int().tolist()
            cls_id = track_info['cls_id']
            category_name = id2label[cls_id] if cls_id in id2label else f'Unknown_{cls_id}'
            
            cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 3)
            
            # 한글처리 위해서 CV => PIL => CV 변환과정 진행
            frame_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            draw = ImageDraw.Draw(frame_pil)
            draw.text((bbox[0], bbox[1] - 30), category_name, font=font, fill=(0, 255, 0))
            frame = cv2.cvtColor(np.array(frame_pil), cv2.COLOR_RGB2BGR)
            
            if track_id in tracks:
                # 기존 정보가 없다면?
                if 'latest_bbox_info' not in tracks[track_id]:
                    tracks[track_id]['latest_bbox_info'] = track_info
                    tracks[track_id]['frame_i'] = i
                    
                # 기존 정보가 있다면 비교!
                else:
                    current_bbox_size = (track_info['bbox'][2] - track_info['bbox'][0]) * (track_info['bbox'][3] - track_info['bbox'][1])
                    stored_bbox_size = (tracks[track_id]['latest_bbox_info']['bbox'][2] - tracks[track_id]['latest_bbox_info']['bbox'][0]) * \
                                       (tracks[track_id]['latest_bbox_info']['bbox'][3] - tracks[track_id]['latest_bbox_info']['bbox'][1])
                    
                    # 현재 bbox 넓이가 더 크면 원래 정보를 업데이트
                    #  track_info : {'bbox': tensor([174.2584, 524.3750, 223.3572, 684.6147]), 'cls_id': 0}
                    if current_bbox_size > stored_bbox_size:
                        tracks[track_id]['latest_bbox_info'] = track_info
                        tracks[track_id]['frame_i'] = i  # 가장 큰 bbox를 가진 프레임 정보 업데이트
            else:
                # 새로운 트랙 ID일 경우, 현재 프레임 정보 저장
                tracks[track_id] = {'latest_bbox_info': track_info, 'frame_i': i}         

    ##################### [추가!!!] 테두리 그려서 좌측상단에 출력 ####################
        # 테두리 그릴 영역 설정!!
        border_size = 15
        color = [0, 0, 255]  # 빨강!!
        
        if prev_cropped_path is not None:
            prev_cropped_frame = cv2.imread(prev_cropped_path)
            resized_prev_cropped_frame = cv2.resize(prev_cropped_frame, (400, 300)) # (가로, 세로)
            
            top, bottom, left, right = 50, 315+2*border_size, 50, 415+2*border_size
            frame[50:350, 50:450] = resized_prev_cropped_frame
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), border_size)  # 테두리 그리기
    #############################################################################
        
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        #cv2.imshow('Frame', frame)
        cv2.waitKey(1)  # 이미지를 1ms 동안 표시. 0을 입력하면 키 입력이 있을 때까지 이미지를 계속 표시

    #####   3. 더 이상 다음 프레임에 해당 track_id가 검출되지 않는다면, tracks{}에 남아있는 bbox, fram_id 정보로 이미지 저장 #####
        # 이전 프레임에서 트래킹했던 track_ID 중에서 현재 프레임에서는 검출되지 않은 track_id를 찾아냄
        disappeared_track_ids = set(tracks.keys()) - set(current_frame_track_info.keys())
        
        # 더 이상 현재 프레임에서 검출되지 않는 track_id 에서 작업 수행
        for disappeared_track_id in disappeared_track_ids:
            try:
                latest_bbox_info = tracks[disappeared_track_id]['latest_bbox_info']
                output_path = os.path.join(output_folder_path, f'frame_{tracks[disappeared_track_id]["frame_i"]}_track_{disappeared_track_id}.jpg')
                
                # [xmin, ymin, xmax, ymax] 정수 coordinate
                bbox = latest_bbox_info['bbox'].int().tolist()
                cls_id = latest_bbox_info['cls_id']
                category_name = id2label[cls_id] if cls_id in id2label else f'Unknown_{cls_id}'
                
                # 가장 큰 bbox를 가진 프레임의 이미지를 다시 불러오기
                img_path = test_paths[tracks[disappeared_track_id]["frame_i"]]
                frame = cv2.imread(img_path)
                cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 3)
                
                # 한글처리 위해서 CV => PIL => CV 변환과정 진행
                frame_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                draw = ImageDraw.Draw(frame_pil)
                draw.text((bbox[0], bbox[1] - 30), category_name, font=font, fill=(0, 255, 0))
                frame = cv2.cvtColor(np.array(frame_pil), cv2.COLOR_RGB2BGR)
        
                cv2.imwrite(output_path, frame)
                print(f'Saved: {output_path} for Track ID: {disappeared_track_id}')

    ############# [추가!!!] bbox 부분만 crop해서 저장 ########################
                cropped_frame = frame[bbox[1]:bbox[3], bbox[0]:bbox[2]]
                cropped_output_path = os.path.join(output_folder_path, f'crop_frame_{tracks[disappeared_track_id]["frame_i"]}_track_{disappeared_track_id}.jpg')
                cv2.imwrite(cropped_output_path, cropped_frame)
                print(f'Crop_Saved: {cropped_output_path} for Track ID: {disappeared_track_id}')
               
                # 다음 프레임에 출력할 crop된 이미지 저장!!
                prev_cropped_path = cropped_output_path
    ######################################################################
                
                # DB/S3 으로 데이터(좌표,날짜,이미지,url)전송
                transfer_data(cursor, conn, s3_client, bucket_name, output_path, category_name)
                
                # 해당 트랙을 더 이상 추적하지 않도록 목록에서 제거
                del tracks[disappeared_track_id]
            
            except Exception as e:
                print(f"Error occurred for Track ID {disappeared_track_id} on frame {i}: {e}")
                
    # 프레임 보여주던 창 닫기!
    cv2.destroyAllWindows()

    #####    4.  프레임이 모두 재생되었는데, 마지막 프레임에 끝까지 검출되는 것이 있다면?   #####
    # tracks{} 에서, 마지막까지 남은 track_id의 정보를 바탕으로 이미지 저장하고 끝냄
    for track_id in tracks.keys():
        try:
            latest_bbox_info = tracks[track_id]['latest_bbox_info']
            output_path = os.path.join(output_folder_path, f'frame_{tracks[track_id]["frame_i"]}_track_{track_id}.jpg')
            bbox = latest_bbox_info['bbox'].int().tolist()
            cls_id = latest_bbox_info['cls_id']
            category_name = id2label[cls_id] if cls_id in id2label else f'Unknown_{cls_id}'
            
            img_path = test_paths[tracks[track_id]["frame_i"]]
            frame = cv2.imread(img_path)
            
            # 한글처리 위해서 CV => PIL => CV 변환과정 진행
            cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 3)
            
            frame_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            draw = ImageDraw.Draw(frame_pil)
            draw.text((bbox[0], bbox[1] - 30), category_name, font=font, fill=(0, 255, 0))
            frame = cv2.cvtColor(np.array(frame_pil), cv2.COLOR_RGB2BGR)
            
            cv2.imwrite(output_path, frame)       

            print(f'Saved: {output_path} for Track ID: {track_id}')
            
            # DB/S3 으로 데이터(좌표,날짜,이미지,url)전송
            transfer_data(cursor, conn, s3_client, bucket_name, output_path, category_name)

        except Exception as e:
            print(f"Error occurred for Track ID {track_id} on the final frame : {e}")

    cursor.close()
    conn.close()
    
@app.route('/image')
def image():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True)