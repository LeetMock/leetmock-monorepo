# ResponseCodeSessionEventsAckCodeSessionEvent


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_events_ack_code_session_event import ResponseCodeSessionEventsAckCodeSessionEvent

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionEventsAckCodeSessionEvent from a JSON string
response_code_session_events_ack_code_session_event_instance = ResponseCodeSessionEventsAckCodeSessionEvent.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionEventsAckCodeSessionEvent.to_json())

# convert the object into a dict
response_code_session_events_ack_code_session_event_dict = response_code_session_events_ack_code_session_event_instance.to_dict()
# create an instance of ResponseCodeSessionEventsAckCodeSessionEvent from a dict
response_code_session_events_ack_code_session_event_from_dict = ResponseCodeSessionEventsAckCodeSessionEvent.from_dict(response_code_session_events_ack_code_session_event_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


