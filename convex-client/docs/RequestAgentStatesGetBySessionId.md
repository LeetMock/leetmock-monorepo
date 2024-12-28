# RequestAgentStatesGetBySessionId


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestSessionsEndSessionArgs**](RequestSessionsEndSessionArgs.md) |  | 

## Example

```python
from convex_client.models.request_agent_states_get_by_session_id import RequestAgentStatesGetBySessionId

# TODO update the JSON string below
json = "{}"
# create an instance of RequestAgentStatesGetBySessionId from a JSON string
request_agent_states_get_by_session_id_instance = RequestAgentStatesGetBySessionId.from_json(json)
# print the JSON string representation of the object
print(RequestAgentStatesGetBySessionId.to_json())

# convert the object into a dict
request_agent_states_get_by_session_id_dict = request_agent_states_get_by_session_id_instance.to_dict()
# create an instance of RequestAgentStatesGetBySessionId from a dict
request_agent_states_get_by_session_id_from_dict = RequestAgentStatesGetBySessionId.from_dict(request_agent_states_get_by_session_id_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


