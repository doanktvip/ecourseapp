@echo off
rem Ép CMD sử dụng UTF-8 để không bị lỗi tiếng Việt
set PYTHONIOENCODING=utf-8
chcp 65001 >nul

echo === Kich hoat moi truong ao ===
call "%~dp0..\.venv\Scripts\activate.bat"

echo === Cai dat thu vien tu requirements.txt ===
pip install -r "%~dp0requirements.txt"

echo === Tao cấu trúc DB (makemigrations) ===
python "%~dp0manage.py" makemigrations

echo === Thuc thi migrate co so du lieu ===
python "%~dp0manage.py" migrate

echo === Tao superuser ===
set DJANGO_SUPERUSER_USERNAME=admin
set DJANGO_SUPERUSER_EMAIL=admin@gmail.com
set DJANGO_SUPERUSER_PASSWORD=Admin@123
python "%~dp0manage.py" createsuperuser --no-input

echo === Chen du lieu mau tu file seed_db.py ===
python "%~dp0manage.py" shell < "%~dp0seed_db.py"

echo === Chay server Django ===
python "%~dp0manage.py" runserver