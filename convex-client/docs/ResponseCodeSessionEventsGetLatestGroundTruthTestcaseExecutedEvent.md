# ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEvent


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValue**](ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValue.md) |  | [optional] 

## Example

```python
from convex_client.models.response_code_session_events_get_latest_ground_truth_testcase_executed_event import ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEvent

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEvent from a JSON string
response_code_session_events_get_latest_ground_truth_testcase_executed_event_instance = ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEvent.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEvent.to_json())

# convert the object into a dict
response_code_session_events_get_latest_ground_truth_testcase_executed_event_dict = response_code_session_events_get_latest_ground_truth_testcase_executed_event_instance.to_dict()
# create an instance of ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEvent from a dict
response_code_session_events_get_latest_ground_truth_testcase_executed_event_from_dict = ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEvent.from_dict(response_code_session_events_get_latest_ground_truth_testcase_executed_event_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


