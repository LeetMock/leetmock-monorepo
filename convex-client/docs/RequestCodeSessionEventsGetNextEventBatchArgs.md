# RequestCodeSessionEventsGetNextEventBatchArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code_session_state_id** | **str** | ID from table \&quot;codeSessionStates\&quot; | 
**limit** | **float** |  | 

## Example

```python
from convex_client.models.request_code_session_events_get_next_event_batch_args import RequestCodeSessionEventsGetNextEventBatchArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestCodeSessionEventsGetNextEventBatchArgs from a JSON string
request_code_session_events_get_next_event_batch_args_instance = RequestCodeSessionEventsGetNextEventBatchArgs.from_json(json)
# print the JSON string representation of the object
print(RequestCodeSessionEventsGetNextEventBatchArgs.to_json())

# convert the object into a dict
request_code_session_events_get_next_event_batch_args_dict = request_code_session_events_get_next_event_batch_args_instance.to_dict()
# create an instance of RequestCodeSessionEventsGetNextEventBatchArgs from a dict
request_code_session_events_get_next_event_batch_args_from_dict = RequestCodeSessionEventsGetNextEventBatchArgs.from_dict(request_code_session_events_get_next_event_batch_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


