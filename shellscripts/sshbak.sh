#!/bin/sh

# The directory to be saved. To avoid a tar warning, it has to be a relative path to root directory
DIR_TO_BACKUP=./home/my_username
# Database name to be saved
DATABASE_NAME=my_database
# Directory to store the backup files
OUTPUT_DIR=backups

# Get the current username
CURRENT_USER=`whoami`
# Current directory
CURRENT_DIRECTORY=`pwd`
# Get the current date and time
CURRENT_TIMESTAMP=`date +%Y-%m-%d_%H-%M-%S`

# The output pathname
FILES_BACKUP_FILENAME=sshbak-$CURRENT_USER-$CURRENT_TIMESTAMP.tar.gz
# Pathname for the mysqldump output
DATABASE_BACKUP_FILENAME=mysql_dump-$DATABASE_NAME-$CURRENT_TIMESTAMP.sql
# The output pathname
FILES_BACKUP_PATHNAME=./$OUTPUT_DIR/$FILES_BACKUP_FILENAME
# Pathname for the mysqldump output
DATABASE_BACKUP_PATHNAME=./$OUTPUT_DIR/$DATABASE_BACKUP_FILENAME

# Backup files data file
BACKUP_FILES_DATA_FILENAME='backup_files.txt'
BACKUP_FILES_DATA_PATHNAME=$OUTPUT_DIR/$BACKUP_FILES_DATA_FILENAME


if [ -n "$(ls -A $OUTPUT_DIR)" ]; then
  # remove old backup files
  rm $OUTPUT_DIR/*
fi



# Create the backup file
tar --create --warning=none --gzip --exclude="$CURRENT_DIRECTORY" --exclude="backup" --exclude="tmp" --exclude="tmpsite" --exclude="git_repos" --exclude="etc" --exclude=".htaccess" --exclude=".trash" -C / --file $FILES_BACKUP_PATHNAME $DIR_TO_BACKUP

# Return value from tar
RETVAL=$?
# Check if there is an error from tar command
if [ $RETVAL -ne 0 ]; then
  exit $RETVAL
fi

cd $CURRENT_DIRECTORY

# Execute the database dump
mysqldump --defaults-extra-file=config.cnf --single-transaction --result-file=$DATABASE_BACKUP_PATHNAME $DATABASE_NAME

# Return value from mysqldump
RETVAL=$?
# check if there is an error from mysqldump command
if [ $RETVAL -ne 0 ]; then
  exit $RETVAL
fi

# Compress de output file
gzip $DATABASE_BACKUP_PATHNAME
# Return value from gzip
RETVAL=$?
# check if there is an error from gzip command
if [ $RETVAL -ne 0 ]; then
  exit $RETVAL
fi

# create the backup data file
echo $FILES_BACKUP_FILENAME > $BACKUP_FILES_DATA_PATHNAME
echo $DATABASE_BACKUP_FILENAME.gz >> $BACKUP_FILES_DATA_PATHNAME
