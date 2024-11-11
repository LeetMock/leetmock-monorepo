# ResponseCodeSessionStatesGetTestCasesState


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_states_get_test_cases_state import ResponseCodeSessionStatesGetTestCasesState

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionStatesGetTestCasesState from a JSON string
response_code_session_states_get_test_cases_state_instance = ResponseCodeSessionStatesGetTestCasesState.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionStatesGetTestCasesState.to_json())

# convert the object into a dict
response_code_session_states_get_test_cases_state_dict = response_code_session_states_get_test_cases_state_instance.to_dict()
# create an instance of ResponseCodeSessionStatesGetTestCasesState from a dict
response_code_session_states_get_test_cases_state_from_dict = ResponseCodeSessionStatesGetTestCasesState.from_dict(response_code_session_states_get_test_cases_state_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


