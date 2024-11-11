# ResponseCodeSessionEventsCommitCodeSessionEvent


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_events_commit_code_session_event import ResponseCodeSessionEventsCommitCodeSessionEvent

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionEventsCommitCodeSessionEvent from a JSON string
response_code_session_events_commit_code_session_event_instance = ResponseCodeSessionEventsCommitCodeSessionEvent.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionEventsCommitCodeSessionEvent.to_json())

# convert the object into a dict
response_code_session_events_commit_code_session_event_dict = response_code_session_events_commit_code_session_event_instance.to_dict()
# create an instance of ResponseCodeSessionEventsCommitCodeSessionEvent from a dict
response_code_session_events_commit_code_session_event_from_dict = ResponseCodeSessionEventsCommitCodeSessionEvent.from_dict(response_code_session_events_commit_code_session_event_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


