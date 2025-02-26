# ResponseJobsTriggerEvalJob


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_jobs_trigger_eval_job import ResponseJobsTriggerEvalJob

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseJobsTriggerEvalJob from a JSON string
response_jobs_trigger_eval_job_instance = ResponseJobsTriggerEvalJob.from_json(json)
# print the JSON string representation of the object
print(ResponseJobsTriggerEvalJob.to_json())

# convert the object into a dict
response_jobs_trigger_eval_job_dict = response_jobs_trigger_eval_job_instance.to_dict()
# create an instance of ResponseJobsTriggerEvalJob from a dict
response_jobs_trigger_eval_job_from_dict = ResponseJobsTriggerEvalJob.from_dict(response_jobs_trigger_eval_job_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


