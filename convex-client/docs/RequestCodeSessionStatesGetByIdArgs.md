# RequestCodeSessionStatesGetByIdArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**session_state_id** | **str** | ID from table \&quot;codeSessionStates\&quot; | [optional] 

## Example

```python
from convex_client.models.request_code_session_states_get_by_id_args import RequestCodeSessionStatesGetByIdArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestCodeSessionStatesGetByIdArgs from a JSON string
request_code_session_states_get_by_id_args_instance = RequestCodeSessionStatesGetByIdArgs.from_json(json)
# print the JSON string representation of the object
print(RequestCodeSessionStatesGetByIdArgs.to_json())

# convert the object into a dict
request_code_session_states_get_by_id_args_dict = request_code_session_states_get_by_id_args_instance.to_dict()
# create an instance of RequestCodeSessionStatesGetByIdArgs from a dict
request_code_session_states_get_by_id_args_from_dict = RequestCodeSessionStatesGetByIdArgs.from_dict(request_code_session_states_get_by_id_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


