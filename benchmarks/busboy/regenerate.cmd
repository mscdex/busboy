rem Make sure to run this in Admin account
rem
call npm run install-node
timeout /t 2
call nvm use 17.2.0
timeout /t 2
call npm run benchmark-all
call nvm use 16.13.1
timeout /t 2
call npm run benchmark-all
call nvm use 14.18.2
timeout /t 2
call npm run benchmark-all
call nvm use 12.22.7
timeout /t 2
call npm run benchmark-all
call npm run combine-results
