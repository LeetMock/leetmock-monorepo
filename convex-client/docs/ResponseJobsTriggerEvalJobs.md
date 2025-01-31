# ResponseJobsTriggerEvalJobs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_jobs_trigger_eval_jobs import ResponseJobsTriggerEvalJobs

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseJobsTriggerEvalJobs from a JSON string
response_jobs_trigger_eval_jobs_instance = ResponseJobsTriggerEvalJobs.from_json(json)
# print the JSON string representation of the object
print(ResponseJobsTriggerEvalJobs.to_json())

# convert the object into a dict
response_jobs_trigger_eval_jobs_dict = response_jobs_trigger_eval_jobs_instance.to_dict()
# create an instance of ResponseJobsTriggerEvalJobs from a dict
response_jobs_trigger_eval_jobs_from_dict = ResponseJobsTriggerEvalJobs.from_dict(response_jobs_trigger_eval_jobs_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


