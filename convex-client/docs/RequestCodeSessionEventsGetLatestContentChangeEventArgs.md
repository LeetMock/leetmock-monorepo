# RequestCodeSessionEventsGetLatestContentChangeEventArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code_session_state_id** | **str** | ID from table \&quot;codeSessionStates\&quot; | 

## Example

```python
from convex_client.models.request_code_session_events_get_latest_content_change_event_args import RequestCodeSessionEventsGetLatestContentChangeEventArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestCodeSessionEventsGetLatestContentChangeEventArgs from a JSON string
request_code_session_events_get_latest_content_change_event_args_instance = RequestCodeSessionEventsGetLatestContentChangeEventArgs.from_json(json)
# print the JSON string representation of the object
print(RequestCodeSessionEventsGetLatestContentChangeEventArgs.to_json())

# convert the object into a dict
request_code_session_events_get_latest_content_change_event_args_dict = request_code_session_events_get_latest_content_change_event_args_instance.to_dict()
# create an instance of RequestCodeSessionEventsGetLatestContentChangeEventArgs from a dict
request_code_session_events_get_latest_content_change_event_args_from_dict = RequestCodeSessionEventsGetLatestContentChangeEventArgs.from_dict(request_code_session_events_get_latest_content_change_event_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


