# ResponseCodeSessionStatesGetSnapshots


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_states_get_snapshots import ResponseCodeSessionStatesGetSnapshots

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionStatesGetSnapshots from a JSON string
response_code_session_states_get_snapshots_instance = ResponseCodeSessionStatesGetSnapshots.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionStatesGetSnapshots.to_json())

# convert the object into a dict
response_code_session_states_get_snapshots_dict = response_code_session_states_get_snapshots_instance.to_dict()
# create an instance of ResponseCodeSessionStatesGetSnapshots from a dict
response_code_session_states_get_snapshots_from_dict = ResponseCodeSessionStatesGetSnapshots.from_dict(response_code_session_states_get_snapshots_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


