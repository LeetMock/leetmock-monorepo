# RequestCodeSessionEventsCommitCodeSessionEventArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event** | [**RequestCodeSessionEventsCommitCodeSessionEventArgsEvent**](RequestCodeSessionEventsCommitCodeSessionEventArgsEvent.md) |  | 
**session_id** | **str** | ID from table \&quot;sessions\&quot; | 

## Example

```python
from convex_client.models.request_code_session_events_commit_code_session_event_args import RequestCodeSessionEventsCommitCodeSessionEventArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestCodeSessionEventsCommitCodeSessionEventArgs from a JSON string
request_code_session_events_commit_code_session_event_args_instance = RequestCodeSessionEventsCommitCodeSessionEventArgs.from_json(json)
# print the JSON string representation of the object
print(RequestCodeSessionEventsCommitCodeSessionEventArgs.to_json())

# convert the object into a dict
request_code_session_events_commit_code_session_event_args_dict = request_code_session_events_commit_code_session_event_args_instance.to_dict()
# create an instance of RequestCodeSessionEventsCommitCodeSessionEventArgs from a dict
request_code_session_events_commit_code_session_event_args_from_dict = RequestCodeSessionEventsCommitCodeSessionEventArgs.from_dict(request_code_session_events_commit_code_session_event_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


