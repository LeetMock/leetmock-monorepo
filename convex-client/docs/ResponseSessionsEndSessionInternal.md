# ResponseSessionsEndSessionInternal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_sessions_end_session_internal import ResponseSessionsEndSessionInternal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseSessionsEndSessionInternal from a JSON string
response_sessions_end_session_internal_instance = ResponseSessionsEndSessionInternal.from_json(json)
# print the JSON string representation of the object
print(ResponseSessionsEndSessionInternal.to_json())

# convert the object into a dict
response_sessions_end_session_internal_dict = response_sessions_end_session_internal_instance.to_dict()
# create an instance of ResponseSessionsEndSessionInternal from a dict
response_sessions_end_session_internal_from_dict = ResponseSessionsEndSessionInternal.from_dict(response_sessions_end_session_internal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


