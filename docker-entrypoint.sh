#!/bin/sh
echo "$API_PORT" > /usr/share/nginx/html/apiport.txt
exec nginx -g 'daemon off;'