import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
import google
import time

cred = credentials.Certificate('./credentials.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'global-intelligence-agency.appspot.com'
})

db = firestore.client()

def create_new_entity_log(url, name, summary, yelp_data=None, google_maps_data=None, linked_in_data=None):
    print(f"Starting to create log for entity with URL: {url}")

    # Provide default values if data is not provided
    yelp_data = yelp_data or {"review_count": 0, "rating": 0.0}
    google_maps_data = google_maps_data or {"total_ratings": 0, "rating": 0.0}
    linked_in_data = linked_in_data or {"company_size": 0}

    # Check for the last log of this entity using the new query syntax
    print("Querying for the last log of this entity...")
    query = (db.collection('kyb_logs')
             .where(filter=firestore.FieldFilter("business_url", "==", url))
             .order_by("created_at", direction=firestore.Query.DESCENDING)
             .limit(1))

    try:
        # Set a timeout for the query
        timeout = 10  # 10 seconds
        start_time = time.time()
        last_log = None
        while time.time() - start_time < timeout:
            try:
                last_log = list(query.stream())
                break
            except google.api_core.exceptions.DeadlineExceeded:
                print("Query timed out, retrying...")
                time.sleep(1)
        else:
            raise TimeoutError("Query timed out after multiple attempts")

        if last_log:
            print("Found a previous log for this entity.")
            last_log_data = last_log[0].to_dict()
            print("Last log data:", last_log_data)
        else:
            print("No previous log found. This will be a new entity log.")
            last_log_data = None

        log_type = determine_log_type(last_log_data, yelp_data, google_maps_data, linked_in_data)

    except google.api_core.exceptions.InvalidArgument as e:
        print(f"Invalid argument error: {e}")
    except google.api_core.exceptions.GoogleAPICallError as e:
        print(f"Firestore API call failed: {e}")
        return None
    except TimeoutError as e:
        print(f"Query timed out: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None


    print(f"Determined log type: {log_type}")

    log_data = {
        'created_at': datetime.now().isoformat(),
        'log_type': log_type,
        'business_url': url,
        'business_name': name,
        'business_summary': summary,
        'yelp_data': yelp_data,
        'google_maps_data': google_maps_data,
        'linked_in_data': linked_in_data,
    }

    if log_type == 'business_growth':
        print("Preparing business growth data...")
        log_data['old_yelp_reviews'] = last_log_data['yelp_data']['review_count'] if last_log_data.get('yelp_data') else None
        log_data['new_yelp_reviews'] = yelp_data['review_count'] if yelp_data else None
        log_data['old_google_reviews'] = last_log_data['google_maps_data']['total_ratings'] if last_log_data.get('google_maps_data') else None
        log_data['new_google_reviews'] = google_maps_data['total_ratings'] if google_maps_data else None
        print(f"Old Yelp reviews: {log_data['old_yelp_reviews']}, New Yelp reviews: {log_data['new_yelp_reviews']}")
        print(f"Old Google reviews: {log_data['old_google_reviews']}, New Google reviews: {log_data['new_google_reviews']}")
    elif log_type == 'org_growth':
        print("Preparing organizational growth data...")
        log_data['old_company_size'] = last_log_data['linked_in_data']['company_size'] if last_log_data.get('linked_in_data') else None
        log_data['new_company_size'] = linked_in_data['company_size'] if linked_in_data else None
        print(f"Old company size: {log_data['old_company_size']}, New company size: {log_data['new_company_size']}")

    print("Adding new log to the database...")
    doc_ref = db.collection('kyb_logs').add(log_data)
    print(f"New {log_type} log created with id: {doc_ref[1].id}")
    print("Log data:")
    for key, value in log_data.items():
        print(f"{key}: {value}")

    return doc_ref[1].id

def determine_log_type(last_log_data, yelp_data, google_maps_data, linked_in_data):
    print("Determining log type...")
    print(f"last_log_data: {last_log_data}")
    print(f"yelp_data: {yelp_data}")
    print(f"google_maps_data: {google_maps_data}")
    print(f"linked_in_data: {linked_in_data}")

    # If there's no previous log, this is a new entity
    if last_log_data is None:
        print("No previous log data. This is a new entity.")
        return 'new_entity'

    # Check for business growth
    if yelp_data and google_maps_data:
        old_yelp_reviews = 0
        if last_log_data.get('yelp_data'):
            old_yelp_reviews = last_log_data['yelp_data']['review_count']
        new_yelp_reviews = yelp_data.get('review_count')

        old_google_reviews = 0
        if last_log_data.get('google_maps_data'):
            old_google_reviews = last_log_data['google_maps_data']['total_ratings']
        new_google_reviews = google_maps_data.get('total_ratings')

        print(f"Old Yelp reviews: {old_yelp_reviews}, New Yelp reviews: {new_yelp_reviews}")
        print(f"Old Google reviews: {old_google_reviews}, New Google reviews: {new_google_reviews}")

        if (old_yelp_reviews is not None and new_yelp_reviews is not None and old_yelp_reviews != new_yelp_reviews) or \
           (old_google_reviews is not None and new_google_reviews is not None and old_google_reviews != new_google_reviews):
            print("Detected change in Yelp reviews or Google ratings.")
            return 'business_growth'

    # Check for org growth
    if linked_in_data:
        old_company_size = last_log_data.get('linked_in_data', {}).get('company_size')
        new_company_size = linked_in_data.get('company_size')

        print(f"Old company size: {old_company_size}, New company size: {new_company_size}")

        if old_company_size is not None and new_company_size is not None and old_company_size != new_company_size:
            print("Detected change in LinkedIn company size.")
            return 'org_growth'

    print("No significant changes detected.")
    return 'new_entity'
    

if __name__ == '__main__':
    create_new_entity_log('https://www.example.com', 'Example Company', 'This is a test business summary.', yelp_data=None, google_maps_data=None, linked_in_data=None)

    # Test business growth (run this after creating the initial entity)
    create_new_entity_log('https://www.example.com', 'Example Company', 'This is a test business summary.',
                          yelp_data={"review_count": 10, "rating": 4.5},
                          google_maps_data={"total_ratings": 20, "rating": 4.2},
                          linked_in_data=None)

    # Test org growth (run this after creating the initial entity)
    create_new_entity_log('https://www.example.com', 'Example Company', 'This is a test business summary.',
                            yelp_data=None,
                            google_maps_data=None,
                          linked_in_data={"company_size": 100},)