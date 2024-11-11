# ResponseCodeSessionStatesGetSessionStateBySessionId


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_states_get_session_state_by_session_id import ResponseCodeSessionStatesGetSessionStateBySessionId

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionStatesGetSessionStateBySessionId from a JSON string
response_code_session_states_get_session_state_by_session_id_instance = ResponseCodeSessionStatesGetSessionStateBySessionId.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionStatesGetSessionStateBySessionId.to_json())

# convert the object into a dict
response_code_session_states_get_session_state_by_session_id_dict = response_code_session_states_get_session_state_by_session_id_instance.to_dict()
# create an instance of ResponseCodeSessionStatesGetSessionStateBySessionId from a dict
response_code_session_states_get_session_state_by_session_id_from_dict = ResponseCodeSessionStatesGetSessionStateBySessionId.from_dict(response_code_session_states_get_session_state_by_session_id_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


