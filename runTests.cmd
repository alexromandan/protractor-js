@echo off

set dir=%1
set directConnect=true
set ITERATIONS=5
set REPLACE="prompt #$H#$E# & FOR %%b IN (1) DO rem"

FOR /F "tokens=1,2 delims=#" %%a IN ('%REPLACE%') DO (
  set "DEL=%%a"
)

FOR /L %%D IN (1,1,%ITERATIONS%) DO (
    @echo on
    call :ColorText 0a "Downloading webdriver binaries, iteration %%D"
    @echo off
	node .\%dir%\node_modules\webdriver-manager\bin\webdriver-manager update --versions.chrome=76.0.3809.126

    IF EXIST ".\%dir%\node_modules\webdriver-manager\selenium\update-config.json" (
        @echo on
        call :ColorText 0a "Binaries downloaded successfully"
        call :ColorText 0a "Running tests"
        @echo off
        node --no-warnings --harmony .\%dir%\node_modules\protractor\built\cli.js .\%dir%\configs\config.js
        EXIT /B
    ) ELSE (
        @echo on
        call :ColorText 0c "Could not find update-config.json"
        @echo off
    )
)

@echo on
call :ColorText 0c "Could not download webdriver binaries after %ITERATIONS% tries, exiting"
@echo off

EXIT /B 1

:ColorText
@echo off
echo|set /p="[%TIME:~0,-3%] "
echo %DEL% > "%~2"
findstr /v /a:%1 /R "^$" "%~2" nul
del "%~2" >nul 2>&1
