# RequestCodeSessionStatesGet


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestSessionsEndSessionArgs**](RequestSessionsEndSessionArgs.md) |  | 

## Example

```python
from convex_client.models.request_code_session_states_get import RequestCodeSessionStatesGet

# TODO update the JSON string below
json = "{}"
# create an instance of RequestCodeSessionStatesGet from a JSON string
request_code_session_states_get_instance = RequestCodeSessionStatesGet.from_json(json)
# print the JSON string representation of the object
print(RequestCodeSessionStatesGet.to_json())

# convert the object into a dict
request_code_session_states_get_dict = request_code_session_states_get_instance.to_dict()
# create an instance of RequestCodeSessionStatesGet from a dict
request_code_session_states_get_from_dict = RequestCodeSessionStatesGet.from_dict(request_code_session_states_get_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


