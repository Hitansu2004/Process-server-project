#!/bin/bash
export MYSQL_PWD='dbuser!!'
mysql -u dbuser -D processserve_db < ~/schema.sql
