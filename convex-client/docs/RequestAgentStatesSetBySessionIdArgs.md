# RequestAgentStatesSetBySessionIdArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**session_id** | **str** | ID from table \&quot;sessions\&quot; | 
**state** | **object** |  | 

## Example

```python
from convex_client.models.request_agent_states_set_by_session_id_args import RequestAgentStatesSetBySessionIdArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestAgentStatesSetBySessionIdArgs from a JSON string
request_agent_states_set_by_session_id_args_instance = RequestAgentStatesSetBySessionIdArgs.from_json(json)
# print the JSON string representation of the object
print(RequestAgentStatesSetBySessionIdArgs.to_json())

# convert the object into a dict
request_agent_states_set_by_session_id_args_dict = request_agent_states_set_by_session_id_args_instance.to_dict()
# create an instance of RequestAgentStatesSetBySessionIdArgs from a dict
request_agent_states_set_by_session_id_args_from_dict = RequestAgentStatesSetBySessionIdArgs.from_dict(request_agent_states_set_by_session_id_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


