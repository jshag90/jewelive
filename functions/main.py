from firebase_admin import initialize_app
from firebase_functions import https_fn

initialize_app()


@https_fn.on_request(region="asia-northeast3")
def health_check(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response(
        response="Jewel-Live functions are ready.",
        status=200,
        mimetype="text/plain",
    )
