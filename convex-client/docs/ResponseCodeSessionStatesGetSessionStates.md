# ResponseCodeSessionStatesGetSessionStates


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_states_get_session_states import ResponseCodeSessionStatesGetSessionStates

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionStatesGetSessionStates from a JSON string
response_code_session_states_get_session_states_instance = ResponseCodeSessionStatesGetSessionStates.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionStatesGetSessionStates.to_json())

# convert the object into a dict
response_code_session_states_get_session_states_dict = response_code_session_states_get_session_states_instance.to_dict()
# create an instance of ResponseCodeSessionStatesGetSessionStates from a dict
response_code_session_states_get_session_states_from_dict = ResponseCodeSessionStatesGetSessionStates.from_dict(response_code_session_states_get_session_states_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


