# convex_client.ActionApi

All URIs are relative to *https://posh-chihuahua-941.convex.cloud*

Method | HTTP request | Description
------------- | ------------- | -------------
[**api_run_actions_create_agent_thread_post**](ActionApi.md#api_run_actions_create_agent_thread_post) | **POST** /api/run/actions/createAgentThread | Calls a action at the path actions.js:createAgentThread
[**api_run_actions_get_session_metadata_post**](ActionApi.md#api_run_actions_get_session_metadata_post) | **POST** /api/run/actions/getSessionMetadata | Calls a action at the path actions.js:getSessionMetadata
[**api_run_actions_get_token_post**](ActionApi.md#api_run_actions_get_token_post) | **POST** /api/run/actions/getToken | Calls a action at the path actions.js:getToken
[**api_run_actions_run_code_post**](ActionApi.md#api_run_actions_run_code_post) | **POST** /api/run/actions/runCode | Calls a action at the path actions.js:runCode
[**api_run_actions_run_ground_truth_test_post**](ActionApi.md#api_run_actions_run_ground_truth_test_post) | **POST** /api/run/actions/runGroundTruthTest | Calls a action at the path actions.js:runGroundTruthTest
[**api_run_actions_run_tests_post**](ActionApi.md#api_run_actions_run_tests_post) | **POST** /api/run/actions/runTests | Calls a action at the path actions.js:runTests
[**api_run_actions_trigger_eval_post**](ActionApi.md#api_run_actions_trigger_eval_post) | **POST** /api/run/actions/triggerEval | Calls a action at the path actions.js:triggerEval


# **api_run_actions_create_agent_thread_post**
> ResponseActionsCreateAgentThread api_run_actions_create_agent_thread_post(request_actions_create_agent_thread)

Calls a action at the path actions.js:createAgentThread

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_actions_create_agent_thread import RequestActionsCreateAgentThread
from convex_client.models.response_actions_create_agent_thread import ResponseActionsCreateAgentThread
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
    api_instance = convex_client.ActionApi(api_client)
    request_actions_create_agent_thread = convex_client.RequestActionsCreateAgentThread() # RequestActionsCreateAgentThread | 

    try:
        # Calls a action at the path actions.js:createAgentThread
        api_response = api_instance.api_run_actions_create_agent_thread_post(request_actions_create_agent_thread)
        print("The response of ActionApi->api_run_actions_create_agent_thread_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ActionApi->api_run_actions_create_agent_thread_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_actions_create_agent_thread** | [**RequestActionsCreateAgentThread**](RequestActionsCreateAgentThread.md)|  | 

### Return type

[**ResponseActionsCreateAgentThread**](ResponseActionsCreateAgentThread.md)

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

# **api_run_actions_get_session_metadata_post**
> ResponseActionsGetSessionMetadata api_run_actions_get_session_metadata_post(request_actions_get_session_metadata)

Calls a action at the path actions.js:getSessionMetadata

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_actions_get_session_metadata import RequestActionsGetSessionMetadata
from convex_client.models.response_actions_get_session_metadata import ResponseActionsGetSessionMetadata
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
    api_instance = convex_client.ActionApi(api_client)
    request_actions_get_session_metadata = convex_client.RequestActionsGetSessionMetadata() # RequestActionsGetSessionMetadata | 

    try:
        # Calls a action at the path actions.js:getSessionMetadata
        api_response = api_instance.api_run_actions_get_session_metadata_post(request_actions_get_session_metadata)
        print("The response of ActionApi->api_run_actions_get_session_metadata_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ActionApi->api_run_actions_get_session_metadata_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_actions_get_session_metadata** | [**RequestActionsGetSessionMetadata**](RequestActionsGetSessionMetadata.md)|  | 

### Return type

[**ResponseActionsGetSessionMetadata**](ResponseActionsGetSessionMetadata.md)

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

# **api_run_actions_get_token_post**
> ResponseActionsGetToken api_run_actions_get_token_post(request_actions_get_token)

Calls a action at the path actions.js:getToken

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_actions_get_token import RequestActionsGetToken
from convex_client.models.response_actions_get_token import ResponseActionsGetToken
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
    api_instance = convex_client.ActionApi(api_client)
    request_actions_get_token = convex_client.RequestActionsGetToken() # RequestActionsGetToken | 

    try:
        # Calls a action at the path actions.js:getToken
        api_response = api_instance.api_run_actions_get_token_post(request_actions_get_token)
        print("The response of ActionApi->api_run_actions_get_token_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ActionApi->api_run_actions_get_token_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_actions_get_token** | [**RequestActionsGetToken**](RequestActionsGetToken.md)|  | 

### Return type

[**ResponseActionsGetToken**](ResponseActionsGetToken.md)

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

# **api_run_actions_run_code_post**
> ResponseActionsRunCode api_run_actions_run_code_post(request_actions_run_code)

Calls a action at the path actions.js:runCode

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_actions_run_code import RequestActionsRunCode
from convex_client.models.response_actions_run_code import ResponseActionsRunCode
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
    api_instance = convex_client.ActionApi(api_client)
    request_actions_run_code = convex_client.RequestActionsRunCode() # RequestActionsRunCode | 

    try:
        # Calls a action at the path actions.js:runCode
        api_response = api_instance.api_run_actions_run_code_post(request_actions_run_code)
        print("The response of ActionApi->api_run_actions_run_code_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ActionApi->api_run_actions_run_code_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_actions_run_code** | [**RequestActionsRunCode**](RequestActionsRunCode.md)|  | 

### Return type

[**ResponseActionsRunCode**](ResponseActionsRunCode.md)

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

# **api_run_actions_run_ground_truth_test_post**
> ResponseActionsRunGroundTruthTest api_run_actions_run_ground_truth_test_post(request_actions_run_ground_truth_test)

Calls a action at the path actions.js:runGroundTruthTest

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_actions_run_ground_truth_test import RequestActionsRunGroundTruthTest
from convex_client.models.response_actions_run_ground_truth_test import ResponseActionsRunGroundTruthTest
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
    api_instance = convex_client.ActionApi(api_client)
    request_actions_run_ground_truth_test = convex_client.RequestActionsRunGroundTruthTest() # RequestActionsRunGroundTruthTest | 

    try:
        # Calls a action at the path actions.js:runGroundTruthTest
        api_response = api_instance.api_run_actions_run_ground_truth_test_post(request_actions_run_ground_truth_test)
        print("The response of ActionApi->api_run_actions_run_ground_truth_test_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ActionApi->api_run_actions_run_ground_truth_test_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_actions_run_ground_truth_test** | [**RequestActionsRunGroundTruthTest**](RequestActionsRunGroundTruthTest.md)|  | 

### Return type

[**ResponseActionsRunGroundTruthTest**](ResponseActionsRunGroundTruthTest.md)

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

# **api_run_actions_run_tests_post**
> ResponseActionsRunTests api_run_actions_run_tests_post(request_actions_run_tests)

Calls a action at the path actions.js:runTests

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_actions_run_tests import RequestActionsRunTests
from convex_client.models.response_actions_run_tests import ResponseActionsRunTests
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
    api_instance = convex_client.ActionApi(api_client)
    request_actions_run_tests = convex_client.RequestActionsRunTests() # RequestActionsRunTests | 

    try:
        # Calls a action at the path actions.js:runTests
        api_response = api_instance.api_run_actions_run_tests_post(request_actions_run_tests)
        print("The response of ActionApi->api_run_actions_run_tests_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ActionApi->api_run_actions_run_tests_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_actions_run_tests** | [**RequestActionsRunTests**](RequestActionsRunTests.md)|  | 

### Return type

[**ResponseActionsRunTests**](ResponseActionsRunTests.md)

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

# **api_run_actions_trigger_eval_post**
> ResponseActionsTriggerEval api_run_actions_trigger_eval_post(request_actions_trigger_eval)

Calls a action at the path actions.js:triggerEval

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_actions_trigger_eval import RequestActionsTriggerEval
from convex_client.models.response_actions_trigger_eval import ResponseActionsTriggerEval
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
    api_instance = convex_client.ActionApi(api_client)
    request_actions_trigger_eval = convex_client.RequestActionsTriggerEval() # RequestActionsTriggerEval | 

    try:
        # Calls a action at the path actions.js:triggerEval
        api_response = api_instance.api_run_actions_trigger_eval_post(request_actions_trigger_eval)
        print("The response of ActionApi->api_run_actions_trigger_eval_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ActionApi->api_run_actions_trigger_eval_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_actions_trigger_eval** | [**RequestActionsTriggerEval**](RequestActionsTriggerEval.md)|  | 

### Return type

[**ResponseActionsTriggerEval**](ResponseActionsTriggerEval.md)

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

