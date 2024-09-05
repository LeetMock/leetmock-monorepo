# convex_client.QueryApi

All URIs are relative to *https://posh-chihuahua-941.convex.cloud*

Method | HTTP request | Description
------------- | ------------- | -------------
[**api_run_editor_snapshots_get_by_id_post**](QueryApi.md#api_run_editor_snapshots_get_by_id_post) | **POST** /api/run/editorSnapshots/getById | Calls a query at the path editorSnapshots.js:getById
[**api_run_editor_snapshots_get_latest_snapshot_by_session_id_post**](QueryApi.md#api_run_editor_snapshots_get_latest_snapshot_by_session_id_post) | **POST** /api/run/editorSnapshots/getLatestSnapshotBySessionId | Calls a query at the path editorSnapshots.js:getLatestSnapshotBySessionId
[**api_run_editor_snapshots_get_snapshots_post**](QueryApi.md#api_run_editor_snapshots_get_snapshots_post) | **POST** /api/run/editorSnapshots/getSnapshots | Calls a query at the path editorSnapshots.js:getSnapshots
[**api_run_questions_get_all_post**](QueryApi.md#api_run_questions_get_all_post) | **POST** /api/run/questions/getAll | Calls a query at the path questions.js:getAll
[**api_run_questions_get_by_id_post**](QueryApi.md#api_run_questions_get_by_id_post) | **POST** /api/run/questions/getById | Calls a query at the path questions.js:getById
[**api_run_sessions_exists_post**](QueryApi.md#api_run_sessions_exists_post) | **POST** /api/run/sessions/exists | Calls a query at the path sessions.js:exists
[**api_run_sessions_get_by_id_post**](QueryApi.md#api_run_sessions_get_by_id_post) | **POST** /api/run/sessions/getById | Calls a query at the path sessions.js:getById


# **api_run_editor_snapshots_get_by_id_post**
> ResponseEditorSnapshotsGetById api_run_editor_snapshots_get_by_id_post(request_editor_snapshots_get_by_id)

Calls a query at the path editorSnapshots.js:getById

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_editor_snapshots_get_by_id import RequestEditorSnapshotsGetById
from convex_client.models.response_editor_snapshots_get_by_id import ResponseEditorSnapshotsGetById
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
    api_instance = convex_client.QueryApi(api_client)
    request_editor_snapshots_get_by_id = convex_client.RequestEditorSnapshotsGetById() # RequestEditorSnapshotsGetById | 

    try:
        # Calls a query at the path editorSnapshots.js:getById
        api_response = api_instance.api_run_editor_snapshots_get_by_id_post(request_editor_snapshots_get_by_id)
        print("The response of QueryApi->api_run_editor_snapshots_get_by_id_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_editor_snapshots_get_by_id_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_editor_snapshots_get_by_id** | [**RequestEditorSnapshotsGetById**](RequestEditorSnapshotsGetById.md)|  | 

### Return type

[**ResponseEditorSnapshotsGetById**](ResponseEditorSnapshotsGetById.md)

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

# **api_run_editor_snapshots_get_latest_snapshot_by_session_id_post**
> ResponseEditorSnapshotsGetLatestSnapshotBySessionId api_run_editor_snapshots_get_latest_snapshot_by_session_id_post(request_editor_snapshots_get_latest_snapshot_by_session_id)

Calls a query at the path editorSnapshots.js:getLatestSnapshotBySessionId

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_editor_snapshots_get_latest_snapshot_by_session_id import RequestEditorSnapshotsGetLatestSnapshotBySessionId
from convex_client.models.response_editor_snapshots_get_latest_snapshot_by_session_id import ResponseEditorSnapshotsGetLatestSnapshotBySessionId
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
    api_instance = convex_client.QueryApi(api_client)
    request_editor_snapshots_get_latest_snapshot_by_session_id = convex_client.RequestEditorSnapshotsGetLatestSnapshotBySessionId() # RequestEditorSnapshotsGetLatestSnapshotBySessionId | 

    try:
        # Calls a query at the path editorSnapshots.js:getLatestSnapshotBySessionId
        api_response = api_instance.api_run_editor_snapshots_get_latest_snapshot_by_session_id_post(request_editor_snapshots_get_latest_snapshot_by_session_id)
        print("The response of QueryApi->api_run_editor_snapshots_get_latest_snapshot_by_session_id_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_editor_snapshots_get_latest_snapshot_by_session_id_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_editor_snapshots_get_latest_snapshot_by_session_id** | [**RequestEditorSnapshotsGetLatestSnapshotBySessionId**](RequestEditorSnapshotsGetLatestSnapshotBySessionId.md)|  | 

### Return type

[**ResponseEditorSnapshotsGetLatestSnapshotBySessionId**](ResponseEditorSnapshotsGetLatestSnapshotBySessionId.md)

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

# **api_run_editor_snapshots_get_snapshots_post**
> ResponseEditorSnapshotsGetSnapshots api_run_editor_snapshots_get_snapshots_post(request_editor_snapshots_get_snapshots)

Calls a query at the path editorSnapshots.js:getSnapshots

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_editor_snapshots_get_snapshots import RequestEditorSnapshotsGetSnapshots
from convex_client.models.response_editor_snapshots_get_snapshots import ResponseEditorSnapshotsGetSnapshots
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
    api_instance = convex_client.QueryApi(api_client)
    request_editor_snapshots_get_snapshots = convex_client.RequestEditorSnapshotsGetSnapshots() # RequestEditorSnapshotsGetSnapshots | 

    try:
        # Calls a query at the path editorSnapshots.js:getSnapshots
        api_response = api_instance.api_run_editor_snapshots_get_snapshots_post(request_editor_snapshots_get_snapshots)
        print("The response of QueryApi->api_run_editor_snapshots_get_snapshots_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_editor_snapshots_get_snapshots_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_editor_snapshots_get_snapshots** | [**RequestEditorSnapshotsGetSnapshots**](RequestEditorSnapshotsGetSnapshots.md)|  | 

### Return type

[**ResponseEditorSnapshotsGetSnapshots**](ResponseEditorSnapshotsGetSnapshots.md)

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

# **api_run_questions_get_all_post**
> ResponseQuestionsGetAll api_run_questions_get_all_post(request_questions_get_all)

Calls a query at the path questions.js:getAll

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_questions_get_all import RequestQuestionsGetAll
from convex_client.models.response_questions_get_all import ResponseQuestionsGetAll
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
    api_instance = convex_client.QueryApi(api_client)
    request_questions_get_all = convex_client.RequestQuestionsGetAll() # RequestQuestionsGetAll | 

    try:
        # Calls a query at the path questions.js:getAll
        api_response = api_instance.api_run_questions_get_all_post(request_questions_get_all)
        print("The response of QueryApi->api_run_questions_get_all_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_questions_get_all_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_questions_get_all** | [**RequestQuestionsGetAll**](RequestQuestionsGetAll.md)|  | 

### Return type

[**ResponseQuestionsGetAll**](ResponseQuestionsGetAll.md)

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

# **api_run_questions_get_by_id_post**
> ResponseQuestionsGetById api_run_questions_get_by_id_post(request_questions_get_by_id)

Calls a query at the path questions.js:getById

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_questions_get_by_id import RequestQuestionsGetById
from convex_client.models.response_questions_get_by_id import ResponseQuestionsGetById
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
    api_instance = convex_client.QueryApi(api_client)
    request_questions_get_by_id = convex_client.RequestQuestionsGetById() # RequestQuestionsGetById | 

    try:
        # Calls a query at the path questions.js:getById
        api_response = api_instance.api_run_questions_get_by_id_post(request_questions_get_by_id)
        print("The response of QueryApi->api_run_questions_get_by_id_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_questions_get_by_id_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_questions_get_by_id** | [**RequestQuestionsGetById**](RequestQuestionsGetById.md)|  | 

### Return type

[**ResponseQuestionsGetById**](ResponseQuestionsGetById.md)

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

# **api_run_sessions_exists_post**
> ResponseSessionsExists api_run_sessions_exists_post(request_sessions_exists)

Calls a query at the path sessions.js:exists

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_sessions_exists import RequestSessionsExists
from convex_client.models.response_sessions_exists import ResponseSessionsExists
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
    api_instance = convex_client.QueryApi(api_client)
    request_sessions_exists = convex_client.RequestSessionsExists() # RequestSessionsExists | 

    try:
        # Calls a query at the path sessions.js:exists
        api_response = api_instance.api_run_sessions_exists_post(request_sessions_exists)
        print("The response of QueryApi->api_run_sessions_exists_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_sessions_exists_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_sessions_exists** | [**RequestSessionsExists**](RequestSessionsExists.md)|  | 

### Return type

[**ResponseSessionsExists**](ResponseSessionsExists.md)

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

# **api_run_sessions_get_by_id_post**
> ResponseSessionsGetById api_run_sessions_get_by_id_post(request_sessions_get_by_id)

Calls a query at the path sessions.js:getById

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_sessions_get_by_id import RequestSessionsGetById
from convex_client.models.response_sessions_get_by_id import ResponseSessionsGetById
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
    api_instance = convex_client.QueryApi(api_client)
    request_sessions_get_by_id = convex_client.RequestSessionsGetById() # RequestSessionsGetById | 

    try:
        # Calls a query at the path sessions.js:getById
        api_response = api_instance.api_run_sessions_get_by_id_post(request_sessions_get_by_id)
        print("The response of QueryApi->api_run_sessions_get_by_id_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_sessions_get_by_id_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_sessions_get_by_id** | [**RequestSessionsGetById**](RequestSessionsGetById.md)|  | 

### Return type

[**ResponseSessionsGetById**](ResponseSessionsGetById.md)

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

