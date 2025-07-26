from flask import Flask, jsonify, request, send_from_directory,abort
from flask_cors import CORS
from SQL import Database
import json
import os
app = Flask(__name__)
CORS(app)  # 🔁 允許前端跨域請求

db = Database(host='127.0.0.1', port=3306, user='root', passwd='', database='edema')
PHOTO_DIR = os.path.join(app.root_path, 'photo')  # 沒有前導斜線！

with open('patients.json', 'r', encoding='utf-8') as f:
    patients_data = json.load(f)
    
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    sql = "SELECT * FROM account WHERE username = %s AND password = %s LIMIT 1"
    result = db.select(sql, (username, password))

    if result:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False}), 401


@app.route('/api/patients')
def get_patients():
    sql = """
        SELECT 
            p.patient_id,
            p.name,
            p.gender,
            p.height,
            p.weight,
            (
                SELECT MAX(f.measurement_time)
                FROM foot_data f
                WHERE f.patient_id = p.patient_id
            ) AS lastCheckDate
        FROM patients p;
    """
    results = db.select(sql)
    
    # 將資料轉為 dict 格式（因為 db.select 預設返回 tuple）
    keys = ['id', 'name', 'gender', 'height', 'weight', 'lastCheckDate']
    data = [dict(zip(keys, row)) for row in results]
    return jsonify(data)

@app.route('/api/patients/<int:patient_id>')
def get_patient(patient_id):
    sql = """
        SELECT 
            p.patient_id,
            p.name,
            p.gender,
            p.height,
            p.weight,
            (
                SELECT MAX(f.measurement_time)
                FROM foot_data f
                WHERE f.patient_id = p.patient_id
            ) AS lastCheckDate
        FROM patients p
        WHERE p.patient_id = %s;
    """
    result = db.select(sql, (patient_id,))
    if not result:
        return jsonify({'error': 'Patient not found'}), 404

    keys = ['id', 'name', 'gender', 'height', 'weight', 'lastCheckDate']
    data = dict(zip(keys, result[0]))
    
    return jsonify(data)

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.json
    sql = """
        UPDATE patients
        SET name = %s,
            gender = %s,
            height = %s,
            weight = %s
        WHERE patient_id = %s
    """
    db.update(sql, (data['name'], data['gender'], data['height'], data['weight'], patient_id))
    return jsonify({'message': 'Patient updated successfully'})

@app.route('/api/patients/<int:patient_id>/foot_data')
def get_foot_data(patient_id):
    sql = f"""
        SELECT
            f.id,
            f.measurement_time AS time,
            f.d_measurement AS manual,
            f.circumference,
            f.area,
            f.photo_path,
            f.remark,
            COALESCE((
                SELECT qr.score
                FROM questionnaire_results qr
                WHERE qr.patient_id = f.patient_id
                  AND DATE(qr.submission_time) = DATE(f.measurement_time)
                LIMIT 1
            ), '-') AS survey
        FROM foot_data f
        WHERE f.patient_id = {patient_id}
        ORDER BY f.measurement_time DESC
    """
    results = db.select(sql)
    keys = ['id','time', 'manual', 'circumference', 'area','photo_path','remark', 'survey']
    data = [dict(zip(keys, row)) for row in results]
    return jsonify(data)

@app.route('/api/patients/<int:patient_id>/foot_data/<int:_id>', methods=['DELETE'])
def delete_foot_data(patient_id, _id):
    try:
        sql = """
            DELETE FROM foot_data 
            WHERE patient_id = %s AND measurement_time = %s
        """
        db.update(sql, (patient_id, _id))
        print('122312')
        return jsonify({'message': 'Deleted successfully'}), 200
    except Exception as e:
        print(f"Delete error: {e}")
        return jsonify({'error': 'Failed to delete'}), 500
    

@app.route('/photo/<path:filename>')
def serve_photo(filename):
    file_path = os.path.join(PHOTO_DIR, filename)
    if not os.path.isfile(file_path):
        abort(404)
    return send_from_directory(PHOTO_DIR, filename)

@app.route('/api/foot_data/<int:entry_id>', methods=['PUT'])
def update_foot_data(entry_id):
    data = request.get_json()
    manual = data.get('manual')
    remark = data.get('remark')

    sql = """
        UPDATE foot_data
        SET d_measurement = %s,
            remark = %s
        WHERE id = %s
    """
    try:
        db.update(sql, (manual, remark, entry_id))
        return jsonify({'message': 'Foot data updated successfully'}), 200
    except Exception as e:
        print(f"Error updating foot data: {e}")
        return jsonify({'error': 'Failed to update foot data'}), 500

@app.route('/api/update_account', methods=['POST'])
def update_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    print(username, password)
    sql = "UPDATE account SET username=%s, password=%s WHERE id = 1 "
    db.update(sql, (username, password))
    return jsonify({'success': True})


if __name__ == '__main__':
    app.run()
