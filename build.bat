@echo off
echo Checking your code... Please wait

if "%~1"=="-c" (
	gulp build
) else (
	echo[
	echo Open buildLog.txt to see the results.

	gulp build >buildLog.txt

	echo Code checking is complete
) 
