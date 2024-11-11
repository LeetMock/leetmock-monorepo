# RequestSessionsCreateCodeSessionArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**agent_thread_id** | **str** |  | 
**assistant_id** | **str** |  | 
**interview_flow** | **List[str]** |  | 
**interview_mode** | [**RequestSessionsCreateCodeSessionArgsInterviewMode**](RequestSessionsCreateCodeSessionArgsInterviewMode.md) |  | 
**interview_type** | [**RequestSessionsCreateCodeSessionArgsInterviewType**](RequestSessionsCreateCodeSessionArgsInterviewType.md) |  | 
**programming_language** | **str** |  | 
**question_id** | **str** | ID from table \&quot;questions\&quot; | 
**time_limit** | **float** |  | 
**voice** | **str** |  | 

## Example

```python
from convex_client.models.request_sessions_create_code_session_args import RequestSessionsCreateCodeSessionArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestSessionsCreateCodeSessionArgs from a JSON string
request_sessions_create_code_session_args_instance = RequestSessionsCreateCodeSessionArgs.from_json(json)
# print the JSON string representation of the object
print(RequestSessionsCreateCodeSessionArgs.to_json())

# convert the object into a dict
request_sessions_create_code_session_args_dict = request_sessions_create_code_session_args_instance.to_dict()
# create an instance of RequestSessionsCreateCodeSessionArgs from a dict
request_sessions_create_code_session_args_from_dict = RequestSessionsCreateCodeSessionArgs.from_dict(request_sessions_create_code_session_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


