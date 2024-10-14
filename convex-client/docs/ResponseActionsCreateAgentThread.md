# ResponseActionsCreateAgentThread


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_actions_create_agent_thread import ResponseActionsCreateAgentThread

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsCreateAgentThread from a JSON string
response_actions_create_agent_thread_instance = ResponseActionsCreateAgentThread.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsCreateAgentThread.to_json())

# convert the object into a dict
response_actions_create_agent_thread_dict = response_actions_create_agent_thread_instance.to_dict()
# create an instance of ResponseActionsCreateAgentThread from a dict
response_actions_create_agent_thread_from_dict = ResponseActionsCreateAgentThread.from_dict(response_actions_create_agent_thread_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


