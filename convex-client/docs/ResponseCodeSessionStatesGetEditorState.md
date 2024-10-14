# ResponseCodeSessionStatesGetEditorState


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_states_get_editor_state import ResponseCodeSessionStatesGetEditorState

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionStatesGetEditorState from a JSON string
response_code_session_states_get_editor_state_instance = ResponseCodeSessionStatesGetEditorState.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionStatesGetEditorState.to_json())

# convert the object into a dict
response_code_session_states_get_editor_state_dict = response_code_session_states_get_editor_state_instance.to_dict()
# create an instance of ResponseCodeSessionStatesGetEditorState from a dict
response_code_session_states_get_editor_state_from_dict = ResponseCodeSessionStatesGetEditorState.from_dict(response_code_session_states_get_editor_state_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


