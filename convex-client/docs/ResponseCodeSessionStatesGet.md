# ResponseCodeSessionStatesGet


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**ResponseCodeSessionStatesGetValue**](ResponseCodeSessionStatesGetValue.md) |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_states_get import ResponseCodeSessionStatesGet

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionStatesGet from a JSON string
response_code_session_states_get_instance = ResponseCodeSessionStatesGet.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionStatesGet.to_json())

# convert the object into a dict
response_code_session_states_get_dict = response_code_session_states_get_instance.to_dict()
# create an instance of ResponseCodeSessionStatesGet from a dict
response_code_session_states_get_from_dict = ResponseCodeSessionStatesGet.from_dict(response_code_session_states_get_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


