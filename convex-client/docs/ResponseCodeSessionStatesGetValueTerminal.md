# ResponseCodeSessionStatesGetValueTerminal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**execution_time** | **float** |  | [optional] 
**is_error** | **bool** |  | 
**output** | **str** |  | 

## Example

```python
from convex_client.models.response_code_session_states_get_value_terminal import ResponseCodeSessionStatesGetValueTerminal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionStatesGetValueTerminal from a JSON string
response_code_session_states_get_value_terminal_instance = ResponseCodeSessionStatesGetValueTerminal.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionStatesGetValueTerminal.to_json())

# convert the object into a dict
response_code_session_states_get_value_terminal_dict = response_code_session_states_get_value_terminal_instance.to_dict()
# create an instance of ResponseCodeSessionStatesGetValueTerminal from a dict
response_code_session_states_get_value_terminal_from_dict = ResponseCodeSessionStatesGetValueTerminal.from_dict(response_code_session_states_get_value_terminal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


