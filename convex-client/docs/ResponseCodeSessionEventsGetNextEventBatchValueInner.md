# ResponseCodeSessionEventsGetNextEventBatchValueInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event** | [**RequestCodeSessionEventsCommitCodeSessionEventArgsEvent**](RequestCodeSessionEventsCommitCodeSessionEventArgsEvent.md) |  | 
**ts** | **float** |  | 

## Example

```python
from convex_client.models.response_code_session_events_get_next_event_batch_value_inner import ResponseCodeSessionEventsGetNextEventBatchValueInner

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionEventsGetNextEventBatchValueInner from a JSON string
response_code_session_events_get_next_event_batch_value_inner_instance = ResponseCodeSessionEventsGetNextEventBatchValueInner.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionEventsGetNextEventBatchValueInner.to_json())

# convert the object into a dict
response_code_session_events_get_next_event_batch_value_inner_dict = response_code_session_events_get_next_event_batch_value_inner_instance.to_dict()
# create an instance of ResponseCodeSessionEventsGetNextEventBatchValueInner from a dict
response_code_session_events_get_next_event_batch_value_inner_from_dict = ResponseCodeSessionEventsGetNextEventBatchValueInner.from_dict(response_code_session_events_get_next_event_batch_value_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


