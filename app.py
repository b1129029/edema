from flask import Flask, jsonify, request
from flask_cors import CORS
from SQL import Database
import json
app = Flask(__name__)
CORS(app)  # 🔁 允許前端跨域請求

db = Database(host='127.0.0.1', port=3306, user='root', passwd='', database='edema')

with open('patients.json', 'r', encoding='utf-8') as f:
    patients_data = json.load(f)

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


if __name__ == '__main__':
    app.run()
