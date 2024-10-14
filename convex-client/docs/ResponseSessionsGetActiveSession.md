# ResponseSessionsGetActiveSession


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_sessions_get_active_session import ResponseSessionsGetActiveSession

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseSessionsGetActiveSession from a JSON string
response_sessions_get_active_session_instance = ResponseSessionsGetActiveSession.from_json(json)
# print the JSON string representation of the object
print(ResponseSessionsGetActiveSession.to_json())

# convert the object into a dict
response_sessions_get_active_session_dict = response_sessions_get_active_session_instance.to_dict()
# create an instance of ResponseSessionsGetActiveSession from a dict
response_sessions_get_active_session_from_dict = ResponseSessionsGetActiveSession.from_dict(response_sessions_get_active_session_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


