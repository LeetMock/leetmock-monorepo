# ResponseAgentStatesGetBySessionId


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**ResponseAgentStatesGetBySessionIdValue**](ResponseAgentStatesGetBySessionIdValue.md) |  | [optional] 

## Example

```python
from convex_client.models.response_agent_states_get_by_session_id import ResponseAgentStatesGetBySessionId

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseAgentStatesGetBySessionId from a JSON string
response_agent_states_get_by_session_id_instance = ResponseAgentStatesGetBySessionId.from_json(json)
# print the JSON string representation of the object
print(ResponseAgentStatesGetBySessionId.to_json())

# convert the object into a dict
response_agent_states_get_by_session_id_dict = response_agent_states_get_by_session_id_instance.to_dict()
# create an instance of ResponseAgentStatesGetBySessionId from a dict
response_agent_states_get_by_session_id_from_dict = ResponseAgentStatesGetBySessionId.from_dict(response_agent_states_get_by_session_id_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


