# ResponseUserProfilesGetCompletedQuestions


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_user_profiles_get_completed_questions import ResponseUserProfilesGetCompletedQuestions

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseUserProfilesGetCompletedQuestions from a JSON string
response_user_profiles_get_completed_questions_instance = ResponseUserProfilesGetCompletedQuestions.from_json(json)
# print the JSON string representation of the object
print(ResponseUserProfilesGetCompletedQuestions.to_json())

# convert the object into a dict
response_user_profiles_get_completed_questions_dict = response_user_profiles_get_completed_questions_instance.to_dict()
# create an instance of ResponseUserProfilesGetCompletedQuestions from a dict
response_user_profiles_get_completed_questions_from_dict = ResponseUserProfilesGetCompletedQuestions.from_dict(response_user_profiles_get_completed_questions_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


