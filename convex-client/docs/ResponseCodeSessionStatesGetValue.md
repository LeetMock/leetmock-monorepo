# ResponseCodeSessionStatesGetValue


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**creation_time** | **float** |  | 
**id** | **str** | ID from table \&quot;codeSessionStates\&quot; | 
**editor** | [**ResponseCodeSessionStatesGetValueEditor**](ResponseCodeSessionStatesGetValueEditor.md) |  | 
**session_id** | **str** | ID from table \&quot;sessions\&quot; | 
**stage** | **str** |  | 
**terminal** | [**ResponseCodeSessionStatesGetValueTerminal**](ResponseCodeSessionStatesGetValueTerminal.md) |  | 
**testcases** | [**List[RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf3DataAfterInner]**](RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf3DataAfterInner.md) |  | 

## Example

```python
from convex_client.models.response_code_session_states_get_value import ResponseCodeSessionStatesGetValue

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionStatesGetValue from a JSON string
response_code_session_states_get_value_instance = ResponseCodeSessionStatesGetValue.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionStatesGetValue.to_json())

# convert the object into a dict
response_code_session_states_get_value_dict = response_code_session_states_get_value_instance.to_dict()
# create an instance of ResponseCodeSessionStatesGetValue from a dict
response_code_session_states_get_value_from_dict = ResponseCodeSessionStatesGetValue.from_dict(response_code_session_states_get_value_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


