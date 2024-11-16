# ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValueEvent


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf6Data**](RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf6Data.md) |  | 
**type** | **str** |  | 

## Example

```python
from convex_client.models.response_code_session_events_get_latest_ground_truth_testcase_executed_event_value_event import ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValueEvent

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValueEvent from a JSON string
response_code_session_events_get_latest_ground_truth_testcase_executed_event_value_event_instance = ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValueEvent.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValueEvent.to_json())

# convert the object into a dict
response_code_session_events_get_latest_ground_truth_testcase_executed_event_value_event_dict = response_code_session_events_get_latest_ground_truth_testcase_executed_event_value_event_instance.to_dict()
# create an instance of ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValueEvent from a dict
response_code_session_events_get_latest_ground_truth_testcase_executed_event_value_event_from_dict = ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValueEvent.from_dict(response_code_session_events_get_latest_ground_truth_testcase_executed_event_value_event_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


