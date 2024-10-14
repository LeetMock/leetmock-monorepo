# ResponseCodeSessionStatesCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_states_create import ResponseCodeSessionStatesCreate

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionStatesCreate from a JSON string
response_code_session_states_create_instance = ResponseCodeSessionStatesCreate.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionStatesCreate.to_json())

# convert the object into a dict
response_code_session_states_create_dict = response_code_session_states_create_instance.to_dict()
# create an instance of ResponseCodeSessionStatesCreate from a dict
response_code_session_states_create_from_dict = ResponseCodeSessionStatesCreate.from_dict(response_code_session_states_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


