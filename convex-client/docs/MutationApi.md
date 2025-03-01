# convex_client.MutationApi

All URIs are relative to *https://useful-meadowlark-907.convex.cloud*

Method | HTTP request | Description
------------- | ------------- | -------------
[**api_run_admins_create_user_profile_post**](MutationApi.md#api_run_admins_create_user_profile_post) | **POST** /api/run/admins/createUserProfile | Calls a mutation at the path admins.js:createUserProfile
[**api_run_admins_patch_user_subscription_post**](MutationApi.md#api_run_admins_patch_user_subscription_post) | **POST** /api/run/admins/patchUserSubscription | Calls a mutation at the path admins.js:patchUserSubscription
[**api_run_agent_states_set_by_session_id_post**](MutationApi.md#api_run_agent_states_set_by_session_id_post) | **POST** /api/run/agentStates/setBySessionId | Calls a mutation at the path agentStates.js:setBySessionId
[**api_run_code_session_events_commit_code_session_event_post**](MutationApi.md#api_run_code_session_events_commit_code_session_event_post) | **POST** /api/run/codeSessionEvents/commitCodeSessionEvent | Calls a mutation at the path codeSessionEvents.js:commitCodeSessionEvent
[**api_run_eval_insert_evaluation_post**](MutationApi.md#api_run_eval_insert_evaluation_post) | **POST** /api/run/eval/insertEvaluation | Calls a mutation at the path eval.js:insertEvaluation
[**api_run_invite_codes_apply_invite_code_post**](MutationApi.md#api_run_invite_codes_apply_invite_code_post) | **POST** /api/run/inviteCodes/applyInviteCode | Calls a mutation at the path inviteCodes.js:applyInviteCode
[**api_run_invite_codes_create_default_user_profile_post**](MutationApi.md#api_run_invite_codes_create_default_user_profile_post) | **POST** /api/run/inviteCodes/createDefaultUserProfile | Calls a mutation at the path inviteCodes.js:createDefaultUserProfile
[**api_run_questions_create_question_post**](MutationApi.md#api_run_questions_create_question_post) | **POST** /api/run/questions/createQuestion | Calls a mutation at the path questions.js:createQuestion
[**api_run_questions_delete_question_post**](MutationApi.md#api_run_questions_delete_question_post) | **POST** /api/run/questions/deleteQuestion | Calls a mutation at the path questions.js:deleteQuestion
[**api_run_questions_update_question_post**](MutationApi.md#api_run_questions_update_question_post) | **POST** /api/run/questions/updateQuestion | Calls a mutation at the path questions.js:updateQuestion
[**api_run_questions_update_starred_post**](MutationApi.md#api_run_questions_update_starred_post) | **POST** /api/run/questions/updateStarred | Calls a mutation at the path questions.js:updateStarred
[**api_run_questions_update_status_post**](MutationApi.md#api_run_questions_update_status_post) | **POST** /api/run/questions/updateStatus | Calls a mutation at the path questions.js:updateStatus
[**api_run_sessions_create_code_session_post**](MutationApi.md#api_run_sessions_create_code_session_post) | **POST** /api/run/sessions/createCodeSession | Calls a mutation at the path sessions.js:createCodeSession
[**api_run_sessions_end_session_post**](MutationApi.md#api_run_sessions_end_session_post) | **POST** /api/run/sessions/endSession | Calls a mutation at the path sessions.js:endSession
[**api_run_sessions_start_session_post**](MutationApi.md#api_run_sessions_start_session_post) | **POST** /api/run/sessions/startSession | Calls a mutation at the path sessions.js:startSession


# **api_run_admins_create_user_profile_post**
> ResponseAdminsCreateUserProfile api_run_admins_create_user_profile_post(request_admins_create_user_profile)

Calls a mutation at the path admins.js:createUserProfile

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_admins_create_user_profile import RequestAdminsCreateUserProfile
from convex_client.models.response_admins_create_user_profile import ResponseAdminsCreateUserProfile
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_admins_create_user_profile = convex_client.RequestAdminsCreateUserProfile() # RequestAdminsCreateUserProfile | 

    try:
        # Calls a mutation at the path admins.js:createUserProfile
        api_response = api_instance.api_run_admins_create_user_profile_post(request_admins_create_user_profile)
        print("The response of MutationApi->api_run_admins_create_user_profile_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_admins_create_user_profile_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_admins_create_user_profile** | [**RequestAdminsCreateUserProfile**](RequestAdminsCreateUserProfile.md)|  | 

### Return type

[**ResponseAdminsCreateUserProfile**](ResponseAdminsCreateUserProfile.md)

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

# **api_run_admins_patch_user_subscription_post**
> ResponseAdminsPatchUserSubscription api_run_admins_patch_user_subscription_post(request_admins_patch_user_subscription)

Calls a mutation at the path admins.js:patchUserSubscription

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_admins_patch_user_subscription import RequestAdminsPatchUserSubscription
from convex_client.models.response_admins_patch_user_subscription import ResponseAdminsPatchUserSubscription
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_admins_patch_user_subscription = convex_client.RequestAdminsPatchUserSubscription() # RequestAdminsPatchUserSubscription | 

    try:
        # Calls a mutation at the path admins.js:patchUserSubscription
        api_response = api_instance.api_run_admins_patch_user_subscription_post(request_admins_patch_user_subscription)
        print("The response of MutationApi->api_run_admins_patch_user_subscription_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_admins_patch_user_subscription_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_admins_patch_user_subscription** | [**RequestAdminsPatchUserSubscription**](RequestAdminsPatchUserSubscription.md)|  | 

### Return type

[**ResponseAdminsPatchUserSubscription**](ResponseAdminsPatchUserSubscription.md)

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

# **api_run_agent_states_set_by_session_id_post**
> ResponseAgentStatesSetBySessionId api_run_agent_states_set_by_session_id_post(request_agent_states_set_by_session_id)

Calls a mutation at the path agentStates.js:setBySessionId

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_agent_states_set_by_session_id import RequestAgentStatesSetBySessionId
from convex_client.models.response_agent_states_set_by_session_id import ResponseAgentStatesSetBySessionId
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_agent_states_set_by_session_id = convex_client.RequestAgentStatesSetBySessionId() # RequestAgentStatesSetBySessionId | 

    try:
        # Calls a mutation at the path agentStates.js:setBySessionId
        api_response = api_instance.api_run_agent_states_set_by_session_id_post(request_agent_states_set_by_session_id)
        print("The response of MutationApi->api_run_agent_states_set_by_session_id_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_agent_states_set_by_session_id_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_agent_states_set_by_session_id** | [**RequestAgentStatesSetBySessionId**](RequestAgentStatesSetBySessionId.md)|  | 

### Return type

[**ResponseAgentStatesSetBySessionId**](ResponseAgentStatesSetBySessionId.md)

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

# **api_run_code_session_events_commit_code_session_event_post**
> ResponseCodeSessionEventsCommitCodeSessionEvent api_run_code_session_events_commit_code_session_event_post(request_code_session_events_commit_code_session_event)

Calls a mutation at the path codeSessionEvents.js:commitCodeSessionEvent

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_code_session_events_commit_code_session_event import RequestCodeSessionEventsCommitCodeSessionEvent
from convex_client.models.response_code_session_events_commit_code_session_event import ResponseCodeSessionEventsCommitCodeSessionEvent
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_code_session_events_commit_code_session_event = convex_client.RequestCodeSessionEventsCommitCodeSessionEvent() # RequestCodeSessionEventsCommitCodeSessionEvent | 

    try:
        # Calls a mutation at the path codeSessionEvents.js:commitCodeSessionEvent
        api_response = api_instance.api_run_code_session_events_commit_code_session_event_post(request_code_session_events_commit_code_session_event)
        print("The response of MutationApi->api_run_code_session_events_commit_code_session_event_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_code_session_events_commit_code_session_event_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_code_session_events_commit_code_session_event** | [**RequestCodeSessionEventsCommitCodeSessionEvent**](RequestCodeSessionEventsCommitCodeSessionEvent.md)|  | 

### Return type

[**ResponseCodeSessionEventsCommitCodeSessionEvent**](ResponseCodeSessionEventsCommitCodeSessionEvent.md)

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

# **api_run_eval_insert_evaluation_post**
> ResponseEvalInsertEvaluation api_run_eval_insert_evaluation_post(request_eval_insert_evaluation)

Calls a mutation at the path eval.js:insertEvaluation

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_eval_insert_evaluation import RequestEvalInsertEvaluation
from convex_client.models.response_eval_insert_evaluation import ResponseEvalInsertEvaluation
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_eval_insert_evaluation = convex_client.RequestEvalInsertEvaluation() # RequestEvalInsertEvaluation | 

    try:
        # Calls a mutation at the path eval.js:insertEvaluation
        api_response = api_instance.api_run_eval_insert_evaluation_post(request_eval_insert_evaluation)
        print("The response of MutationApi->api_run_eval_insert_evaluation_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_eval_insert_evaluation_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_eval_insert_evaluation** | [**RequestEvalInsertEvaluation**](RequestEvalInsertEvaluation.md)|  | 

### Return type

[**ResponseEvalInsertEvaluation**](ResponseEvalInsertEvaluation.md)

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

# **api_run_invite_codes_apply_invite_code_post**
> ResponseInviteCodesApplyInviteCode api_run_invite_codes_apply_invite_code_post(request_invite_codes_apply_invite_code)

Calls a mutation at the path inviteCodes.js:applyInviteCode

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_invite_codes_apply_invite_code import RequestInviteCodesApplyInviteCode
from convex_client.models.response_invite_codes_apply_invite_code import ResponseInviteCodesApplyInviteCode
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_invite_codes_apply_invite_code = convex_client.RequestInviteCodesApplyInviteCode() # RequestInviteCodesApplyInviteCode | 

    try:
        # Calls a mutation at the path inviteCodes.js:applyInviteCode
        api_response = api_instance.api_run_invite_codes_apply_invite_code_post(request_invite_codes_apply_invite_code)
        print("The response of MutationApi->api_run_invite_codes_apply_invite_code_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_invite_codes_apply_invite_code_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_invite_codes_apply_invite_code** | [**RequestInviteCodesApplyInviteCode**](RequestInviteCodesApplyInviteCode.md)|  | 

### Return type

[**ResponseInviteCodesApplyInviteCode**](ResponseInviteCodesApplyInviteCode.md)

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

# **api_run_invite_codes_create_default_user_profile_post**
> ResponseInviteCodesCreateDefaultUserProfile api_run_invite_codes_create_default_user_profile_post(request_invite_codes_create_default_user_profile)

Calls a mutation at the path inviteCodes.js:createDefaultUserProfile

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_invite_codes_create_default_user_profile import RequestInviteCodesCreateDefaultUserProfile
from convex_client.models.response_invite_codes_create_default_user_profile import ResponseInviteCodesCreateDefaultUserProfile
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_invite_codes_create_default_user_profile = convex_client.RequestInviteCodesCreateDefaultUserProfile() # RequestInviteCodesCreateDefaultUserProfile | 

    try:
        # Calls a mutation at the path inviteCodes.js:createDefaultUserProfile
        api_response = api_instance.api_run_invite_codes_create_default_user_profile_post(request_invite_codes_create_default_user_profile)
        print("The response of MutationApi->api_run_invite_codes_create_default_user_profile_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_invite_codes_create_default_user_profile_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_invite_codes_create_default_user_profile** | [**RequestInviteCodesCreateDefaultUserProfile**](RequestInviteCodesCreateDefaultUserProfile.md)|  | 

### Return type

[**ResponseInviteCodesCreateDefaultUserProfile**](ResponseInviteCodesCreateDefaultUserProfile.md)

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

# **api_run_questions_create_question_post**
> ResponseQuestionsCreateQuestion api_run_questions_create_question_post(request_questions_create_question)

Calls a mutation at the path questions.js:createQuestion

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_questions_create_question import RequestQuestionsCreateQuestion
from convex_client.models.response_questions_create_question import ResponseQuestionsCreateQuestion
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_questions_create_question = convex_client.RequestQuestionsCreateQuestion() # RequestQuestionsCreateQuestion | 

    try:
        # Calls a mutation at the path questions.js:createQuestion
        api_response = api_instance.api_run_questions_create_question_post(request_questions_create_question)
        print("The response of MutationApi->api_run_questions_create_question_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_questions_create_question_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_questions_create_question** | [**RequestQuestionsCreateQuestion**](RequestQuestionsCreateQuestion.md)|  | 

### Return type

[**ResponseQuestionsCreateQuestion**](ResponseQuestionsCreateQuestion.md)

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

# **api_run_questions_delete_question_post**
> ResponseQuestionsDeleteQuestion api_run_questions_delete_question_post(request_questions_delete_question)

Calls a mutation at the path questions.js:deleteQuestion

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_questions_delete_question import RequestQuestionsDeleteQuestion
from convex_client.models.response_questions_delete_question import ResponseQuestionsDeleteQuestion
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_questions_delete_question = convex_client.RequestQuestionsDeleteQuestion() # RequestQuestionsDeleteQuestion | 

    try:
        # Calls a mutation at the path questions.js:deleteQuestion
        api_response = api_instance.api_run_questions_delete_question_post(request_questions_delete_question)
        print("The response of MutationApi->api_run_questions_delete_question_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_questions_delete_question_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_questions_delete_question** | [**RequestQuestionsDeleteQuestion**](RequestQuestionsDeleteQuestion.md)|  | 

### Return type

[**ResponseQuestionsDeleteQuestion**](ResponseQuestionsDeleteQuestion.md)

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

# **api_run_questions_update_question_post**
> ResponseQuestionsUpdateQuestion api_run_questions_update_question_post(request_questions_update_question)

Calls a mutation at the path questions.js:updateQuestion

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_questions_update_question import RequestQuestionsUpdateQuestion
from convex_client.models.response_questions_update_question import ResponseQuestionsUpdateQuestion
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_questions_update_question = convex_client.RequestQuestionsUpdateQuestion() # RequestQuestionsUpdateQuestion | 

    try:
        # Calls a mutation at the path questions.js:updateQuestion
        api_response = api_instance.api_run_questions_update_question_post(request_questions_update_question)
        print("The response of MutationApi->api_run_questions_update_question_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_questions_update_question_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_questions_update_question** | [**RequestQuestionsUpdateQuestion**](RequestQuestionsUpdateQuestion.md)|  | 

### Return type

[**ResponseQuestionsUpdateQuestion**](ResponseQuestionsUpdateQuestion.md)

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

# **api_run_questions_update_starred_post**
> ResponseQuestionsUpdateStarred api_run_questions_update_starred_post(request_questions_update_starred)

Calls a mutation at the path questions.js:updateStarred

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_questions_update_starred import RequestQuestionsUpdateStarred
from convex_client.models.response_questions_update_starred import ResponseQuestionsUpdateStarred
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_questions_update_starred = convex_client.RequestQuestionsUpdateStarred() # RequestQuestionsUpdateStarred | 

    try:
        # Calls a mutation at the path questions.js:updateStarred
        api_response = api_instance.api_run_questions_update_starred_post(request_questions_update_starred)
        print("The response of MutationApi->api_run_questions_update_starred_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_questions_update_starred_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_questions_update_starred** | [**RequestQuestionsUpdateStarred**](RequestQuestionsUpdateStarred.md)|  | 

### Return type

[**ResponseQuestionsUpdateStarred**](ResponseQuestionsUpdateStarred.md)

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

# **api_run_questions_update_status_post**
> ResponseQuestionsUpdateStatus api_run_questions_update_status_post(request_questions_update_status)

Calls a mutation at the path questions.js:updateStatus

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_questions_update_status import RequestQuestionsUpdateStatus
from convex_client.models.response_questions_update_status import ResponseQuestionsUpdateStatus
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_questions_update_status = convex_client.RequestQuestionsUpdateStatus() # RequestQuestionsUpdateStatus | 

    try:
        # Calls a mutation at the path questions.js:updateStatus
        api_response = api_instance.api_run_questions_update_status_post(request_questions_update_status)
        print("The response of MutationApi->api_run_questions_update_status_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_questions_update_status_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_questions_update_status** | [**RequestQuestionsUpdateStatus**](RequestQuestionsUpdateStatus.md)|  | 

### Return type

[**ResponseQuestionsUpdateStatus**](ResponseQuestionsUpdateStatus.md)

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

# **api_run_sessions_create_code_session_post**
> ResponseSessionsCreateCodeSession api_run_sessions_create_code_session_post(request_sessions_create_code_session)

Calls a mutation at the path sessions.js:createCodeSession

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_sessions_create_code_session import RequestSessionsCreateCodeSession
from convex_client.models.response_sessions_create_code_session import ResponseSessionsCreateCodeSession
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_sessions_create_code_session = convex_client.RequestSessionsCreateCodeSession() # RequestSessionsCreateCodeSession | 

    try:
        # Calls a mutation at the path sessions.js:createCodeSession
        api_response = api_instance.api_run_sessions_create_code_session_post(request_sessions_create_code_session)
        print("The response of MutationApi->api_run_sessions_create_code_session_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_sessions_create_code_session_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_sessions_create_code_session** | [**RequestSessionsCreateCodeSession**](RequestSessionsCreateCodeSession.md)|  | 

### Return type

[**ResponseSessionsCreateCodeSession**](ResponseSessionsCreateCodeSession.md)

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

# **api_run_sessions_end_session_post**
> ResponseSessionsEndSession api_run_sessions_end_session_post(request_sessions_end_session)

Calls a mutation at the path sessions.js:endSession

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_sessions_end_session import RequestSessionsEndSession
from convex_client.models.response_sessions_end_session import ResponseSessionsEndSession
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_sessions_end_session = convex_client.RequestSessionsEndSession() # RequestSessionsEndSession | 

    try:
        # Calls a mutation at the path sessions.js:endSession
        api_response = api_instance.api_run_sessions_end_session_post(request_sessions_end_session)
        print("The response of MutationApi->api_run_sessions_end_session_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_sessions_end_session_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_sessions_end_session** | [**RequestSessionsEndSession**](RequestSessionsEndSession.md)|  | 

### Return type

[**ResponseSessionsEndSession**](ResponseSessionsEndSession.md)

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

# **api_run_sessions_start_session_post**
> ResponseSessionsStartSession api_run_sessions_start_session_post(request_sessions_start_session)

Calls a mutation at the path sessions.js:startSession

### Example

* Bearer Authentication (bearerAuth):

```python
import convex_client
from convex_client.models.request_sessions_start_session import RequestSessionsStartSession
from convex_client.models.response_sessions_start_session import ResponseSessionsStartSession
from convex_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://useful-meadowlark-907.convex.cloud
# See configuration.py for a list of all supported configuration parameters.
configuration = convex_client.Configuration(
    host = "https://useful-meadowlark-907.convex.cloud"
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
    request_sessions_start_session = convex_client.RequestSessionsStartSession() # RequestSessionsStartSession | 

    try:
        # Calls a mutation at the path sessions.js:startSession
        api_response = api_instance.api_run_sessions_start_session_post(request_sessions_start_session)
        print("The response of MutationApi->api_run_sessions_start_session_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MutationApi->api_run_sessions_start_session_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_sessions_start_session** | [**RequestSessionsStartSession**](RequestSessionsStartSession.md)|  | 

### Return type

[**ResponseSessionsStartSession**](ResponseSessionsStartSession.md)

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

