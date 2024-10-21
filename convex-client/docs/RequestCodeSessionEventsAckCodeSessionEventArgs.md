# RequestCodeSessionEventsAckCodeSessionEventArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event_id** | **str** | ID from table \&quot;codeSessionEvents\&quot; | 

## Example

```python
from convex_client.models.request_code_session_events_ack_code_session_event_args import RequestCodeSessionEventsAckCodeSessionEventArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestCodeSessionEventsAckCodeSessionEventArgs from a JSON string
request_code_session_events_ack_code_session_event_args_instance = RequestCodeSessionEventsAckCodeSessionEventArgs.from_json(json)
# print the JSON string representation of the object
print(RequestCodeSessionEventsAckCodeSessionEventArgs.to_json())

# convert the object into a dict
request_code_session_events_ack_code_session_event_args_dict = request_code_session_events_ack_code_session_event_args_instance.to_dict()
# create an instance of RequestCodeSessionEventsAckCodeSessionEventArgs from a dict
request_code_session_events_ack_code_session_event_args_from_dict = RequestCodeSessionEventsAckCodeSessionEventArgs.from_dict(request_code_session_events_ack_code_session_event_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


