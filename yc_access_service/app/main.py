import schedule
import time
import jwt
import json
import requests
import os
import redis

class IamTokenRetriever:
	_folder_id = None

	def __init__(self):
		pass

	def exchange_jwt_for_iam_token(self, jwt_token):
			# finally I started writing descriptions...
			"""
			Exchanges a JWT token for an IAM token.

			Parameters:
			- jwt_token: JWT token to exchange.

			Returns:
			- IAM token.
			"""
			url = "https://iam.api.cloud.yandex.net/iam/v1/tokens"
			headers = {
					"Content-Type": "application/json"
			}
			data = {
					"jwt": jwt_token
			}

			response = requests.post(url, headers=headers, json=data)
			if response.status_code == 200:
					return response.json()["iamToken"]
			else:
					raise Exception(f"Failed to get IAM token. Status code: {response.status_code}\n{response.text}")

	def retrieve_private_data(self):
		keys_file_path = ""
		try:
			keys_file_path = os.environ["YC_KEYS_PATH"]
		except KeyError as e:
			print(f"Environment variable {e} is not set.")
			exit(1)

		service_account_id = ""
		private_key = ""
		key_id = ""

		try:
			with open(keys_file_path, 'r') as file:
				data = json.load(file)
				private_key = data.get('private_key')
				key_id = data.get('key_id')
				service_account_id = data.get('service_account_id')
				
				# Also refresh folder ID from Yandex Cloud
				self._folder_id = data.get('folder_id')

		except FileNotFoundError:
			print(f"File {keys_file_path} not found")
			exit(1)
		except json.JSONDecodeError:
			print(f"Error while reading JSON {keys_file_path}")
			exit(1)
		
		return service_account_id, private_key, key_id

	def fetch_iam_token(self):
		print(f"[DEBUG] fetch_iam_token: called IAM token")
		service_account_id, private_key, key_id = self.retrieve_private_data()
		
		now = int(time.time())
		payload = {
			'aud': 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
			'iss': service_account_id,
			'iat': now,
			'exp': now + 3600
		}
		
		# JWT creation
		encoded_token = jwt.encode(
			payload,
			private_key,
			algorithm='PS256',
			headers={'kid': key_id}
		)

		iam_token = self.exchange_jwt_for_iam_token(encoded_token)

		redis_client = redis.Redis(host='redis', port=6379, db=0)
		redis_client.set('IAM_TOKEN', iam_token)
		redis_client.set('FOLDER_ID', self._folder_id)

		print(f"[DEBUG] fetch_iam_token: setted up IAM token")

	def run(self):
		# TODO: make it env var
		# Scheduling requesting IAM token for each 59 minutes
		schedule.every(59).minutes.do(self.fetch_iam_token)

		while True:
			schedule.run_pending()
			time.sleep(1)

if __name__ == "__main__":
	print(f"[DEBUG] IamTokenRetriever started")
	token_retriever = IamTokenRetriever()
	token_retriever.run()