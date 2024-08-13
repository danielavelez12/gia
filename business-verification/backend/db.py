import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime

cred = credentials.Certificate('./credentials.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'fast-kyc.appspot.com'
})

db = firestore.client()

bucket = storage.bucket()

def create_new_entity_log(url, name, summary, yelp_data, google_maps_data, linked_in_data):
        log_data = {
            'created_at': datetime.now().isoformat(),
            'log_type': 'new_entity',
            'business_url': url,
            'business_name': name,
            'business_summary': summary,
            'yelp_data': yelp_data,
            'google_maps_data': google_maps_data,
            'linked_in_data': linked_in_data,
        }
        doc_ref = db.collection('kyb_logs').add(log_data)
        print("New entity log created with id: {0}".format(doc_ref[1].id))
        print("Log data:")
        for key, value in log_data.items():
            print(f"{key}: {value}")
        return doc_ref[1].id