FROM python:3-slim

WORKDIR /usr/src/app

## Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

## Copy the code
COPY src src

## Create user that will run the app
RUN addgroup --system iotcrawler
RUN adduser --system --disabled-password --gecos '' --no-create-home --ingroup iotcrawler patternextractor
RUN chown -R patternextractor:iotcrawler .

## Make sure we are not running as root
USER patternextractor:iotcrawler

## Start the App
CMD ["python", "src/patternExtractor.py"]