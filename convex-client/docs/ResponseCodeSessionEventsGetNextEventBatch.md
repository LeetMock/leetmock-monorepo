# ResponseCodeSessionEventsGetNextEventBatch


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**List[ResponseCodeSessionEventsGetNextEventBatchValueInner]**](ResponseCodeSessionEventsGetNextEventBatchValueInner.md) |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_events_get_next_event_batch import ResponseCodeSessionEventsGetNextEventBatch

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionEventsGetNextEventBatch from a JSON string
response_code_session_events_get_next_event_batch_instance = ResponseCodeSessionEventsGetNextEventBatch.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionEventsGetNextEventBatch.to_json())

# convert the object into a dict
response_code_session_events_get_next_event_batch_dict = response_code_session_events_get_next_event_batch_instance.to_dict()
# create an instance of ResponseCodeSessionEventsGetNextEventBatch from a dict
response_code_session_events_get_next_event_batch_from_dict = ResponseCodeSessionEventsGetNextEventBatch.from_dict(response_code_session_events_get_next_event_batch_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


