# convex_client.MutationApi

All URIs are relative to *https://posh-chihuahua-941.convex.cloud*

Method | HTTP request | Description
------------- | ------------- | -------------
[**api_run_editor_snapshots_create_post**](MutationApi.md#api_run_editor_snapshots_create_post) | **POST** /api/run/editorSnapshots/create | Calls a mutation at the path editorSnapshots.js:create
[**api_run_sessions_create_post**](MutationApi.md#api_run_sessions_create_post) | **POST** /api/run/sessions/create | Calls a mutation at the path sessions.js:create


# **api_run_editor_snapshots_create_post**
> ResponseEditorSnapshotsCreate api_run_editor_snapshots_create_post(request_editor_snapshots_create)

Calls a mutation at the path editorSnapshots.js:create

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_editor_snapshots_create import RequestEditorSnapshotsCreate
from convex_client.models.response_editor_snapshots_create import ResponseEditorSnapshotsCreate
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://posh-chihuahua-941.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://posh-chihuahua-941.convex.cloud"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: bearerAuth
configuration = convex_client.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with convex_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = convex_client.MutationApi(api_client)
    request_editor_snapshots_create = convex_client.RequestEditorSnapshotsCreate() # RequestEditorSnapshotsCreate | 

    try:
        # Calls a mutation at the path editorSnapshots.js:create
        api_response = api_instance.api_run_editor_snapshots_create_post(request_editor_snapshots_create)
        print("The response of MutationApi->api_run_editor_snapshots_create_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_editor_snapshots_create_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_editor_snapshots_create** | [**RequestEditorSnapshotsCreate**](RequestEditorSnapshotsCreate.md)|  | 

### Return type

[**ResponseEditorSnapshotsCreate**](ResponseEditorSnapshotsCreate.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Convex executed your request and returned a result |  -  |
**400** | Failed operation |  -  |
**500** | Convex Internal Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_run_sessions_create_post**
> ResponseSessionsCreate api_run_sessions_create_post(request_sessions_create)

Calls a mutation at the path sessions.js:create

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_sessions_create import RequestSessionsCreate
from convex_client.models.response_sessions_create import ResponseSessionsCreate
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://posh-chihuahua-941.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://posh-chihuahua-941.convex.cloud"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: bearerAuth
configuration = convex_client.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with convex_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = convex_client.MutationApi(api_client)
    request_sessions_create = convex_client.RequestSessionsCreate() # RequestSessionsCreate | 

    try:
        # Calls a mutation at the path sessions.js:create
        api_response = api_instance.api_run_sessions_create_post(request_sessions_create)
        print("The response of MutationApi->api_run_sessions_create_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_sessions_create_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_sessions_create** | [**RequestSessionsCreate**](RequestSessionsCreate.md)|  | 

### Return type

[**ResponseSessionsCreate**](ResponseSessionsCreate.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Convex executed your request and returned a result |  -  |
**400** | Failed operation |  -  |
**500** | Convex Internal Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

