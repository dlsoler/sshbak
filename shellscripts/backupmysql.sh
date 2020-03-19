#!/bin/sh

# Database name to be saved
DATABASE_NAME=my_database
# Pathname for the mysqldump output
RESULT_FILE=backups/mysql_dump.sql
# Execute the database dump
mysqldump --defaults-extra-file=config.cnf --single-transaction --result-file=$RESULT_FILE $DATABASE_NAME
# Return value from mysqldump
RETVAL=$?
# check if there is an error
if [ $RETVAL -ne 0 ]; then
  exit $RETVAL
fi
# Compress de output file
gzip $RESULT_FILE

