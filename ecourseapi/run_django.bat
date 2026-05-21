@echo off
rem Ep CMD su dung UTF-8
set PYTHONIOENCODING=utf-8
chcp 65001 >nul

echo === Kich hoat moi truong ao ===
call "%~dp0..\.venv\Scripts\activate.bat"

echo === Cai dat thu vien tu requirements.txt ===
pip install -r "%~dp0requirements.txt"

echo === Tao cau truc DB (makemigrations) ===
python "%~dp0manage.py" makemigrations

echo === Thuc thi migrate co so du lieu ===
python "%~dp0manage.py" migrate

echo === Xoa sach DB cu va Reset ID ve 1 (Flush) ===
python "%~dp0manage.py" flush --no-input

echo === Chen du lieu mau tu file seed_db.py ===
python "%~dp0manage.py" shell < "%~dp0seed_db.py"

echo === Tu dong tao ung dung OAuth2 Client ===
python "%~dp0create_client.py"

echo === Chay server Django ===
python "%~dp0manage.py" runserver 0.0.0.0:8000