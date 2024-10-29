# convex_client.QueryApi

All URIs are relative to *https://neat-warbler-689.convex.cloud*

Method | HTTP request | Description
------------- | ------------- | -------------
[**api_run_code_session_events_get_next_content_change_event_post**](QueryApi.md#api_run_code_session_events_get_next_content_change_event_post) | **POST** /api/run/codeSessionEvents/getNextContentChangeEvent | Calls a query at the path codeSessionEvents.js:getNextContentChangeEvent
[**api_run_code_session_states_get_editor_state_post**](QueryApi.md#api_run_code_session_states_get_editor_state_post) | **POST** /api/run/codeSessionStates/getEditorState | Calls a query at the path codeSessionStates.js:getEditorState
[**api_run_code_session_states_get_post**](QueryApi.md#api_run_code_session_states_get_post) | **POST** /api/run/codeSessionStates/get | Calls a query at the path codeSessionStates.js:get
[**api_run_code_session_states_get_session_state_by_session_id_post**](QueryApi.md#api_run_code_session_states_get_session_state_by_session_id_post) | **POST** /api/run/codeSessionStates/getSessionStateBySessionId | Calls a query at the path codeSessionStates.js:getSessionStateBySessionId
[**api_run_code_session_states_get_terminal_state_post**](QueryApi.md#api_run_code_session_states_get_terminal_state_post) | **POST** /api/run/codeSessionStates/getTerminalState | Calls a query at the path codeSessionStates.js:getTerminalState
[**api_run_code_session_states_get_test_cases_state_post**](QueryApi.md#api_run_code_session_states_get_test_cases_state_post) | **POST** /api/run/codeSessionStates/getTestCasesState | Calls a query at the path codeSessionStates.js:getTestCasesState
[**api_run_questions_get_all_post**](QueryApi.md#api_run_questions_get_all_post) | **POST** /api/run/questions/getAll | Calls a query at the path questions.js:getAll
[**api_run_questions_get_by_id_post**](QueryApi.md#api_run_questions_get_by_id_post) | **POST** /api/run/questions/getById | Calls a query at the path questions.js:getById
[**api_run_sessions_exists_post**](QueryApi.md#api_run_sessions_exists_post) | **POST** /api/run/sessions/exists | Calls a query at the path sessions.js:exists
[**api_run_sessions_get_active_session_post**](QueryApi.md#api_run_sessions_get_active_session_post) | **POST** /api/run/sessions/getActiveSession | Calls a query at the path sessions.js:getActiveSession
[**api_run_sessions_get_by_id_post**](QueryApi.md#api_run_sessions_get_by_id_post) | **POST** /api/run/sessions/getById | Calls a query at the path sessions.js:getById
[**api_run_sessions_get_by_user_id_post**](QueryApi.md#api_run_sessions_get_by_user_id_post) | **POST** /api/run/sessions/getByUserId | Calls a query at the path sessions.js:getByUserId
[**api_run_user_profiles_get_user_profile_post**](QueryApi.md#api_run_user_profiles_get_user_profile_post) | **POST** /api/run/userProfiles/getUserProfile | Calls a query at the path userProfiles.js:getUserProfile


# **api_run_code_session_events_get_next_content_change_event_post**
> ResponseCodeSessionEventsGetNextContentChangeEvent api_run_code_session_events_get_next_content_change_event_post(request_code_session_events_get_next_content_change_event)

Calls a query at the path codeSessionEvents.js:getNextContentChangeEvent

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_code_session_events_get_next_content_change_event import RequestCodeSessionEventsGetNextContentChangeEvent
from convex_client.models.response_code_session_events_get_next_content_change_event import ResponseCodeSessionEventsGetNextContentChangeEvent
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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
    request_code_session_events_get_next_content_change_event = convex_client.RequestCodeSessionEventsGetNextContentChangeEvent() # RequestCodeSessionEventsGetNextContentChangeEvent | 

    try:
        # Calls a query at the path codeSessionEvents.js:getNextContentChangeEvent
        api_response = api_instance.api_run_code_session_events_get_next_content_change_event_post(request_code_session_events_get_next_content_change_event)
        print("The response of QueryApi->api_run_code_session_events_get_next_content_change_event_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_code_session_events_get_next_content_change_event_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_code_session_events_get_next_content_change_event** | [**RequestCodeSessionEventsGetNextContentChangeEvent**](RequestCodeSessionEventsGetNextContentChangeEvent.md)|  | 

### Return type

[**ResponseCodeSessionEventsGetNextContentChangeEvent**](ResponseCodeSessionEventsGetNextContentChangeEvent.md)

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

# **api_run_code_session_states_get_editor_state_post**
> ResponseCodeSessionStatesGetEditorState api_run_code_session_states_get_editor_state_post(request_code_session_states_get_editor_state)

Calls a query at the path codeSessionStates.js:getEditorState

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_code_session_states_get_editor_state import RequestCodeSessionStatesGetEditorState
from convex_client.models.response_code_session_states_get_editor_state import ResponseCodeSessionStatesGetEditorState
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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
    request_code_session_states_get_editor_state = convex_client.RequestCodeSessionStatesGetEditorState() # RequestCodeSessionStatesGetEditorState | 

    try:
        # Calls a query at the path codeSessionStates.js:getEditorState
        api_response = api_instance.api_run_code_session_states_get_editor_state_post(request_code_session_states_get_editor_state)
        print("The response of QueryApi->api_run_code_session_states_get_editor_state_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_code_session_states_get_editor_state_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_code_session_states_get_editor_state** | [**RequestCodeSessionStatesGetEditorState**](RequestCodeSessionStatesGetEditorState.md)|  | 

### Return type

[**ResponseCodeSessionStatesGetEditorState**](ResponseCodeSessionStatesGetEditorState.md)

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

# **api_run_code_session_states_get_post**
> ResponseCodeSessionStatesGet api_run_code_session_states_get_post(request_code_session_states_get)

Calls a query at the path codeSessionStates.js:get

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_code_session_states_get import RequestCodeSessionStatesGet
from convex_client.models.response_code_session_states_get import ResponseCodeSessionStatesGet
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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
    request_code_session_states_get = convex_client.RequestCodeSessionStatesGet() # RequestCodeSessionStatesGet | 

    try:
        # Calls a query at the path codeSessionStates.js:get
        api_response = api_instance.api_run_code_session_states_get_post(request_code_session_states_get)
        print("The response of QueryApi->api_run_code_session_states_get_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_code_session_states_get_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_code_session_states_get** | [**RequestCodeSessionStatesGet**](RequestCodeSessionStatesGet.md)|  | 

### Return type

[**ResponseCodeSessionStatesGet**](ResponseCodeSessionStatesGet.md)

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

# **api_run_code_session_states_get_session_state_by_session_id_post**
> ResponseCodeSessionStatesGetSessionStateBySessionId api_run_code_session_states_get_session_state_by_session_id_post(request_code_session_states_get_session_state_by_session_id)

Calls a query at the path codeSessionStates.js:getSessionStateBySessionId

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_code_session_states_get_session_state_by_session_id import RequestCodeSessionStatesGetSessionStateBySessionId
from convex_client.models.response_code_session_states_get_session_state_by_session_id import ResponseCodeSessionStatesGetSessionStateBySessionId
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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
    request_code_session_states_get_session_state_by_session_id = convex_client.RequestCodeSessionStatesGetSessionStateBySessionId() # RequestCodeSessionStatesGetSessionStateBySessionId | 

    try:
        # Calls a query at the path codeSessionStates.js:getSessionStateBySessionId
        api_response = api_instance.api_run_code_session_states_get_session_state_by_session_id_post(request_code_session_states_get_session_state_by_session_id)
        print("The response of QueryApi->api_run_code_session_states_get_session_state_by_session_id_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_code_session_states_get_session_state_by_session_id_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_code_session_states_get_session_state_by_session_id** | [**RequestCodeSessionStatesGetSessionStateBySessionId**](RequestCodeSessionStatesGetSessionStateBySessionId.md)|  | 

### Return type

[**ResponseCodeSessionStatesGetSessionStateBySessionId**](ResponseCodeSessionStatesGetSessionStateBySessionId.md)

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

# **api_run_code_session_states_get_terminal_state_post**
> ResponseCodeSessionStatesGetTerminalState api_run_code_session_states_get_terminal_state_post(request_code_session_states_get_terminal_state)

Calls a query at the path codeSessionStates.js:getTerminalState

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_code_session_states_get_terminal_state import RequestCodeSessionStatesGetTerminalState
from convex_client.models.response_code_session_states_get_terminal_state import ResponseCodeSessionStatesGetTerminalState
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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
    request_code_session_states_get_terminal_state = convex_client.RequestCodeSessionStatesGetTerminalState() # RequestCodeSessionStatesGetTerminalState | 

    try:
        # Calls a query at the path codeSessionStates.js:getTerminalState
        api_response = api_instance.api_run_code_session_states_get_terminal_state_post(request_code_session_states_get_terminal_state)
        print("The response of QueryApi->api_run_code_session_states_get_terminal_state_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_code_session_states_get_terminal_state_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_code_session_states_get_terminal_state** | [**RequestCodeSessionStatesGetTerminalState**](RequestCodeSessionStatesGetTerminalState.md)|  | 

### Return type

[**ResponseCodeSessionStatesGetTerminalState**](ResponseCodeSessionStatesGetTerminalState.md)

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

# **api_run_code_session_states_get_test_cases_state_post**
> ResponseCodeSessionStatesGetTestCasesState api_run_code_session_states_get_test_cases_state_post(request_code_session_states_get_test_cases_state)

Calls a query at the path codeSessionStates.js:getTestCasesState

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_code_session_states_get_test_cases_state import RequestCodeSessionStatesGetTestCasesState
from convex_client.models.response_code_session_states_get_test_cases_state import ResponseCodeSessionStatesGetTestCasesState
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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
    request_code_session_states_get_test_cases_state = convex_client.RequestCodeSessionStatesGetTestCasesState() # RequestCodeSessionStatesGetTestCasesState | 

    try:
        # Calls a query at the path codeSessionStates.js:getTestCasesState
        api_response = api_instance.api_run_code_session_states_get_test_cases_state_post(request_code_session_states_get_test_cases_state)
        print("The response of QueryApi->api_run_code_session_states_get_test_cases_state_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_code_session_states_get_test_cases_state_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_code_session_states_get_test_cases_state** | [**RequestCodeSessionStatesGetTestCasesState**](RequestCodeSessionStatesGetTestCasesState.md)|  | 

### Return type

[**ResponseCodeSessionStatesGetTestCasesState**](ResponseCodeSessionStatesGetTestCasesState.md)

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

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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

# **api_run_sessions_get_active_session_post**
> ResponseSessionsGetActiveSession api_run_sessions_get_active_session_post(request_sessions_get_active_session)

Calls a query at the path sessions.js:getActiveSession

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_sessions_get_active_session import RequestSessionsGetActiveSession
from convex_client.models.response_sessions_get_active_session import ResponseSessionsGetActiveSession
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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
    request_sessions_get_active_session = convex_client.RequestSessionsGetActiveSession() # RequestSessionsGetActiveSession | 

    try:
        # Calls a query at the path sessions.js:getActiveSession
        api_response = api_instance.api_run_sessions_get_active_session_post(request_sessions_get_active_session)
        print("The response of QueryApi->api_run_sessions_get_active_session_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_sessions_get_active_session_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_sessions_get_active_session** | [**RequestSessionsGetActiveSession**](RequestSessionsGetActiveSession.md)|  | 

### Return type

[**ResponseSessionsGetActiveSession**](ResponseSessionsGetActiveSession.md)

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

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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

# **api_run_sessions_get_by_user_id_post**
> ResponseSessionsGetByUserId api_run_sessions_get_by_user_id_post(request_sessions_get_by_user_id)

Calls a query at the path sessions.js:getByUserId

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_sessions_get_by_user_id import RequestSessionsGetByUserId
from convex_client.models.response_sessions_get_by_user_id import ResponseSessionsGetByUserId
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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
    request_sessions_get_by_user_id = convex_client.RequestSessionsGetByUserId() # RequestSessionsGetByUserId | 

    try:
        # Calls a query at the path sessions.js:getByUserId
        api_response = api_instance.api_run_sessions_get_by_user_id_post(request_sessions_get_by_user_id)
        print("The response of QueryApi->api_run_sessions_get_by_user_id_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_sessions_get_by_user_id_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_sessions_get_by_user_id** | [**RequestSessionsGetByUserId**](RequestSessionsGetByUserId.md)|  | 

### Return type

[**ResponseSessionsGetByUserId**](ResponseSessionsGetByUserId.md)

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

# **api_run_user_profiles_get_user_profile_post**
> ResponseUserProfilesGetUserProfile api_run_user_profiles_get_user_profile_post(request_user_profiles_get_user_profile)

Calls a query at the path userProfiles.js:getUserProfile

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_user_profiles_get_user_profile import RequestUserProfilesGetUserProfile
from convex_client.models.response_user_profiles_get_user_profile import ResponseUserProfilesGetUserProfile
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://neat-warbler-689.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://neat-warbler-689.convex.cloud"
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
    request_user_profiles_get_user_profile = convex_client.RequestUserProfilesGetUserProfile() # RequestUserProfilesGetUserProfile | 

    try:
        # Calls a query at the path userProfiles.js:getUserProfile
        api_response = api_instance.api_run_user_profiles_get_user_profile_post(request_user_profiles_get_user_profile)
        print("The response of QueryApi->api_run_user_profiles_get_user_profile_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling QueryApi->api_run_user_profiles_get_user_profile_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_user_profiles_get_user_profile** | [**RequestUserProfilesGetUserProfile**](RequestUserProfilesGetUserProfile.md)|  | 

### Return type

[**ResponseUserProfilesGetUserProfile**](ResponseUserProfilesGetUserProfile.md)

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

