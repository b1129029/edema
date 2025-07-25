# -*- coding: utf-8 -*-
"""
Created on Sat Jul  5 15:33:06 2025

@author: LiFish
"""

import requests

def test_get_test_api():
    url = "http://127.0.0.1:5000/get_test"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print("✅ 成功取得資料：")
            print(data)
        else:
            print(f"❌ 錯誤：狀態碼 {response.status_code}")
            print(response.text)
    except Exception as e:
        print("❌ 發生錯誤：", e)

if __name__ == "__main__":
    test_get_test_api()
